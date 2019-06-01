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
        speed_x: 12 * 60,
        speed_y: 3 * 60,
        min_speed_y: 0,
        max_speed_y: 25 * 60,
        score: 0,
        current_state: null,
        camera: {
            type: cc.Camera,
            default: null
        },
        background: {
            type: cc.Node,
            default: null
        },
        settle: {
            type: cc.Prefab,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //小球状态
        this.state = {
            NORMAL: 'normal',
            ACCELERATION: 'acceleration',
            DECELERATION: 'deceleration'
        }
        //小球最后获取糖果数
        this.candy_list = {
            deduct: 0,
            increase: 0,
            quicken: 0,
            slow: 0,
        };
        //canvas根节点
        this.canvas = this.camera.node.parent;
        //ball相对background位置
        this.initial_y = this.background.y - this.node.parent.y;
        //是否向左或向右
        this.isLeft = false;
        this.isRight = false;
        //注册按键执行与取消
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        // console.log(cc.find('Canvas/settle/deduct/text'));
        
    },

    start() {
        this.current_state = this.state.NORMAL;
    },

    update(dt) {
        //判断小球运动方式
        if (this.isLeft) {
            this.moveLeft(dt);
        }
        if (this.isRight) {
            this.moveRight(dt);
        }
        this.ballMove(dt);
        this.cameraMove();
        
        // this.camera.node.y = this.node.y;
        // console.log(this.speed_y);
        // console.log(this.current_state);
        
    },

    //用户操作
    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.isLeft = true;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.isRight = true;
                break;
        }
    },

    onKeyUp(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.isLeft = false;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.isRight = false;
                break;
        }
    },

    onTouchStart(event) {
        if (this.isMoved) {
            return;
        }
        // console.log('start', this.isMoved);
        let x = event.getLocation().x;
        if (x < 0.5 * this.canvas.width) {
            this.isLeft = true;
        } else {
            this.isRight = true;
        }
    },
    
    onTouchMove(event) {
        this.isMoved = true;
        // console.log('move', this.isMoved);
        let x = event.getDelta().x;
        if (x < 0) {
            this.isLeft = true;
            this.isRight = false;
        } 
        if (x > 0) {
            this.isRight = true;
            this.isLeft = false;
        }
        // console.log(this.isLeft, this.isRight);
    },
    
    onTouchEnd() {
        if (this.isMoved) {
            this.isMoved = !this.isMoved;
        }
        // console.log('end', this.isMoved);
        this.isLeft = false;
        this.isRight = false;
    },

    //控制小球移动
    moveLeft(dt) {
        if (this.node.x > -0.5 * (this.canvas.width - this.node.width)) {
            this.node.x -= this.speed_x * dt;
        }
    },

    moveRight(dt) {
        if (this.node.x < 0.5 * (this.canvas.width - this.node.width)) {
            this.node.x += this.speed_x * dt;
        }
    },

    //小球运动管理
    ballMove(dt) {
        this.isAcOver = false;
        if (this.speed_y <= this.max_speed_y) {
            this.a = 2 * 60;
        } else if (this.isAcOver) {
            this.a = -2 * 60;
        }
        //小球所到达最远临界距离
        let ball_critical_y = -(this.background.height - this.initial_y - 0.5 * this.node.height);
        if (this.node.y > ball_critical_y) {
            this.speed_y += this.a * dt;
        } else {
            this.speed_y = 0;
            this.scheduleOnce(() => {
                // cc.director.pause();
                this.gameSettle();
            }, 0);
        }
        if (this.speed_y >= this.max_speed_y && this.current_state !== this.state.ACCELERATION) {
            this.speed_y = this.max_speed_y;
        }
        this.node.y -= this.speed_y * dt;
    },

    //镜头运动管理
    cameraMove() {
        //相机所到达最远临界距离
        let camera_critical_y = this.canvas.height - this.background.height;
        if (this.camera.node.y > camera_critical_y) {
            this.camera.node.y = this.node.y;
        } else {
            this.camera.node.y = camera_critical_y;
        }
    },

    onCollisionEnter(other, self) {
        //碰撞糖果效果
        let type = other.node.getComponent('candy').type
        switch (type) {
            case 'deduct':
                this.candy_list.deduct += 1;
                this.score -= Math.pow(Math.floor(this.speed_y / 10), 2);
                break;
            case 'increase':
                this.candy_list.increase += 1;
                this.score += Math.pow(Math.floor(this.speed_y / 10), 2);
                break;
            case 'quicken':
                this.candy_list.quicken += 1;
                if (this.current_state === this.state.DECELERATION) {
                    break;
                }
                var offset = 3 * 60;
                this.current_state = this.state.ACCELERATION;
                //处于非减速状态才能加速
                this.speed_y += offset;     
                this.scheduleOnce(() => {
                    //加速结束
                    this.isAcOver = true;
                    this.current_state = this.state.NORMAL;
                }, 2);
                break;
            case 'slow':
                this.candy_list.slow += 1;
                this.current_state = this.state.DECELERATION;        
                var offset = 6 * 60;
                if (this.speed_y <= offset) {
                    this.speed_y = this.min_speed_y;
                } else {
                    this.speed_y -= offset;
                }
                //小球减速动画
                
                //
                this.scheduleOnce(() => {
                    this.current_state = this.state.NORMAL;
                }, 3);
                break;
            default:
                break;
        }
        // console.log(this.speed_y, type, this.score, this.current_state);
        // console.log(this.score);
        
    },

    gameSettle() {
        let last_bg = this.background.children.slice(-1)[0];
        let settle = cc.instantiate(this.settle);
        settle.setPosition(0, 0);
        settle.getChildByName('score').getComponent(cc.Label).string = this.score;
        settle.getChildByName('deduct').getChildByName('text').getComponent(cc.Label).string = this.candy_list.deduct;
        settle.getChildByName('increase').getChildByName('text').getComponent(cc.Label).string = this.candy_list.increase;
        settle.getChildByName('quicken').getChildByName('text').getComponent(cc.Label).string = this.candy_list.quicken;
        settle.getChildByName('slow').getChildByName('text').getComponent(cc.Label).string = this.candy_list.slow;
        last_bg.addChild(settle);
        // console.log(settle);
        // console.log(this.candy_list);
    }

});
