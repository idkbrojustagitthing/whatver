//=============================================================================
// MaximizeButtonFullscreen.js
//=============================================================================

/*:
 * @plugindesc 最大化ボタンのフルスクリーン化
 * @author 綱兵
 *
 * @help ウィンドウの最大化ボタンをフルスクリーン処理に置き換えます。
 * フルスクリーン後はF4キーで元に戻せます。
 * 
 * スクリプトでフルスクリーンを解除したい場合は
 * Graphics._cancelFullScreen();
 * を実行してください。
 */

(function () {

    let win = window.require("nw.gui").Window.get();

    win.on("maximize", function () {
        this.unmaximize();
        Graphics._requestFullScreen();
    });

})();
