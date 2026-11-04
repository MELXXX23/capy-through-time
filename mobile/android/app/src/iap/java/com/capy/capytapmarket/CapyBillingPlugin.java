package com.capy.capytapmarket;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONException;

/**
 * Разові покупки Google Play для платних скінів. Гра (src/275_iap.js) кличе getProducts, buy, owned.
 * Цей файл входить у збірку, лише коли є mobile/iap.json (див. app/build.gradle).
 * Куплене зберігає Google; покупку підтверджуємо одразу, інакше за 3 дні Google сам повертає гроші.
 */
@CapacitorPlugin(name = "CapyBilling")
public class CapyBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient client;
    private final Map<String, ProductDetails> details = new HashMap<>();
    private PluginCall buyCall;

    @Override
    public void load() {
        client = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .build();
    }

    @Override
    protected void handleOnResume() {
        notifyListeners("changed", new JSObject());          // повернення в гру: купленого могло стати більше або менше
    }

    private void connected(PluginCall call, Runnable ok) {
        if (client.isReady()) { ok.run(); return; }
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult r) {
                if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) ok.run();
                else call.reject("billing " + r.getResponseCode());
            }
            @Override
            public void onBillingServiceDisconnected() { /* бібліотека перепідключиться сама */ }
        });
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        JSArray ids = call.getArray("products");
        if (ids == null) { call.reject("no products"); return; }
        List<QueryProductDetailsParams.Product> list = new ArrayList<>();
        try {
            for (String id : ids.<String>toList()) {
                list.add(QueryProductDetailsParams.Product.newBuilder().setProductId(id).setProductType(BillingClient.ProductType.INAPP).build());
            }
        } catch (JSONException e) { call.reject("bad products"); return; }
        if (list.isEmpty()) { JSObject empty = new JSObject(); empty.put("products", new JSArray()); call.resolve(empty); return; }
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder().setProductList(list).build();
        connected(call, () -> client.queryProductDetailsAsync(params, (r, res) -> {
            if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) { call.reject("billing " + r.getResponseCode()); return; }
            JSArray out = new JSArray();
            for (ProductDetails d : res.getProductDetailsList()) {
                details.put(d.getProductId(), d);
                ProductDetails.OneTimePurchaseOfferDetails o = d.getOneTimePurchaseOfferDetails();
                JSObject one = new JSObject();
                one.put("id", d.getProductId());
                one.put("price", o != null ? o.getFormattedPrice() : "");
                out.put(one);
            }
            JSObject ret = new JSObject();
            ret.put("products", out);
            call.resolve(ret);
        }));
    }

    @PluginMethod
    public void buy(PluginCall call) {
        ProductDetails d = details.get(call.getString("product", ""));
        if (d == null) { call.reject("product not loaded"); return; }
        if (buyCall != null) { call.reject("busy"); return; }
        BillingFlowParams params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(Collections.singletonList(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build()))
            .build();
        connected(call, () -> getActivity().runOnUiThread(() -> {
            buyCall = call;
            BillingResult r = client.launchBillingFlow(getActivity(), params);
            if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) finishBuy(statusOf(r.getResponseCode()));
        }));
    }

    @PluginMethod
    public void owned(PluginCall call) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build();
        connected(call, () -> client.queryPurchasesAsync(params, (r, list) -> {
            if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) { call.reject("billing " + r.getResponseCode()); return; }
            JSArray out = new JSArray();
            for (Purchase p : list) {
                if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) continue;
                acknowledge(p);
                for (String id : p.getProducts()) out.put(id);
            }
            JSObject ret = new JSObject();
            ret.put("owned", out);
            call.resolve(ret);
        }));
    }

    @Override
    public void onPurchasesUpdated(BillingResult r, List<Purchase> list) {
        int code = r.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && list != null) {
            boolean bought = false;
            for (Purchase p : list) {
                if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) { acknowledge(p); bought = true; }
            }
            finishBuy(bought ? "ok" : "pending");
            notifyListeners("changed", new JSObject());
            return;
        }
        finishBuy(statusOf(code));
    }

    private void acknowledge(Purchase p) {
        if (p.isAcknowledged()) return;
        client.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(), res -> { /* якщо не вийшло, повторимо при наступній перевірці */ });
    }

    private static String statusOf(int code) {
        if (code == BillingClient.BillingResponseCode.USER_CANCELED) return "cancelled";
        if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) return "owned";
        return "error";
    }

    private void finishBuy(String status) {
        if (buyCall == null) return;
        JSObject ret = new JSObject();
        ret.put("status", status);
        buyCall.resolve(ret);
        buyCall = null;
    }
}
