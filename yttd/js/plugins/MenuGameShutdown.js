//=============================================================================
// MenuGameShutdown.js
//=============================================================================

/*:
 * @plugindesc ゲーム終了にウィンドウシャットダウンを追加
 * @author 綱兵
 *
 * @help メニュー画面のゲーム終了に、
 * ウィンドウをシャットダウンする項目を追加します。
 */

(function () {

    Scene_GameEnd.prototype.createCommandWindow = function () {
        this._commandWindow = new Window_GameEnd();
        this._commandWindow.setHandler('GameEnd', this.commandGameEnd.bind(this)); //追加
        this._commandWindow.setHandler('toTitle', this.commandToTitle.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };

    Window_GameEnd_prototype_makeCommandList = Window_GameEnd.prototype.makeCommandList;
    Window_GameEnd.prototype.makeCommandList = function () {
        this.addCommand(TextManager.gameEnd, 'GameEnd');
        Window_GameEnd_prototype_makeCommandList.call(this);
    };

    Scene_GameEnd.prototype.commandGameEnd = function () {
        var gui = require("nw.gui");
        if (typeof gui !== "undefined") {
            var win = gui.Window.get();
            if (typeof nw === "object") {
                nw.App.quit();
            } else {
                win.close(true);
            }
        }
    };

})();
