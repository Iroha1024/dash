// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        type: '',
        audio: {
            type: cc.Node,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        
    },

    update (dt) {

    },

    onCollisionEnter(other, self) {
        self.node.removeFromParent();
        // self.node.destroy();
        let ball = other.node.getComponent('ball');
        this.playAudio(ball);
    },

    init(x, y, type) {
        this.node.x = x;
        this.node.y = y;
        this.type = type;
        this.playAnimation();
    },

    //播放动画
    playAnimation() {
        let anim = this.node.getComponent(cc.Animation);
        let anim_state = anim.play(this.type);
        anim_state.repeatCount = Infinity;
    },

    //播放音效
    playAudio(ball) {
        let audio = this.audio.getComponent('audio');
        cc.audioEngine.setEffectsVolume(0.5);
        switch (this.type) {
            case 'deduct':
                let id1 = cc.audioEngine.playEffect(audio.deduct, false);
                cc.audioEngine.setCurrentTime(id1, 1);
                break;
            case 'increase':
                let id2 = cc.audioEngine.playEffect(audio.increase, false);
                cc.audioEngine.setCurrentTime(id2, 0.5);
                break;
            case 'quicken':
                //减速状态下不播放加速音效
                if (ball.current_state === ball.state.DECELERATION) {
                    break;
                }
                let id3 = cc.audioEngine.playEffect(audio.quicken, false);
                cc.audioEngine.setCurrentTime(id3, 1);
                break;
            case 'slow':
                let id4 = cc.audioEngine.playEffect(audio.slow, false);
                cc.audioEngine.setCurrentTime(id4, 1);
                break;
            default:
                break;
        }
    }
});
