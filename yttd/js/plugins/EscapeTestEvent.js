//=============================================================================
// EscapeTestEvent.js
//=============================================================================

/*:
 * @plugindesc イベントエディタでのテストエラー回避
 * @author 綱兵
 *
 * @help 英語版コモンイベントなどの読み込み関係で
 * イベントエディタでのテストプレイでエラーが起きる問題の対策プラグインです。
 * 
 * 本公開時にはこのプラグインをオフにしてください。
 */

(function () {

    DataManager.loadDatabase = function () {
        var test = this.isBattleTest() || this.isEventTest();
        var prefix = test ? 'Test_' : '';
        for (var i = 0; i < this._databaseFiles.length; i++) {
            var name = this._databaseFiles[i].name;
            var src = this._databaseFiles[i].src;
            this.loadDataFile(name, src);
        }
        if (this.isEventTest()) {
            this.loadDataFile('$testEvent', prefix + 'Event.json');
        }
    };

})();
