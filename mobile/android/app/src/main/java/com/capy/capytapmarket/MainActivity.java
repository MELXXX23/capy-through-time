package com.capy.capytapmarket;

import android.os.Bundle;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {

    @Override
    @SuppressWarnings("unchecked")
    protected void onCreate(Bundle savedInstanceState) {
        // Оплати є лише в збірці з mobile/iap.json (src/iap/java); без них цього класу просто немає
        try { registerPlugin((Class<? extends Plugin>) Class.forName("com.capy.capytapmarket.CapyBillingPlugin")); } catch (ClassNotFoundException e) { /* збірка без оплат */ }
        super.onCreate(savedInstanceState);
        // Великий шрифт у налаштуваннях телефона не має ламати розкладку гри
        getBridge().getWebView().getSettings().setTextZoom(100);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) return;
        // На весь екран; смуги системи з'являються ненадовго від змаху з краю
        Window window = getWindow();
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(window, window.getDecorView());
        bars.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        bars.hide(WindowInsetsCompat.Type.systemBars());
    }
}
