//=============================================================================
// BB_AlltimeIcon.js
//=============================================================================

/*:
 * @plugindesc アイテム名で制御文字を使用可能にするプラグイン
 * @author ビービー
 *
 * @help アイテム名で制御文字を使用可能にします
 * 
 * 
 * このプラグインにプラグインコマンドはありません。
 * 
 * 
 * 利用規約：
 * 作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 * についても制限はありません。
 * このプラグインはもうあなたのものです。
 *
 */

(function() {

Window_Base.prototype.drawItemName = function(item, x, y, width) {
    width = width || 312;
    if (item) {
        var iconBoxWidth = Window_Base._iconWidth + 4;
        this.resetTextColor();
        this.drawIcon(item.iconIndex, x + 2, y + 2);
        this.drawTextEx(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
    }
};

})();