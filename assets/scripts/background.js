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
        bg_count: 15,
        ball: {
            type: cc.Node,
            default: null
        },
        bg_list: {
            type: [cc.Prefab],
            default: []
        },
        candy: {
            type: cc.Node,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //canvas自动获取焦点
        document.getElementById('GameCanvas').focus();
        //开启碰撞检测
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        //canvas
        this.canvas = this.node.parent;
        //下次插入background节点的子节点
        this.insert_bg_num = 0;
        this.initCandy();
        //注册触摸事件
        let ball = this.ball.getComponent('ball');
        this.node.on(cc.Node.EventType.TOUCH_START, ball.onTouchStart, ball);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, ball.onTouchMove, ball);
        this.node.on(cc.Node.EventType.TOUCH_END, ball.onTouchEnd, ball);
        //获取candy在bg内信息
        // cc.loader.loadRes('json/candy.json', (err, res) => {
        //     // console.log(err);
        //     res = res.json;
        //     this.candy_map = res;
        // });
        this.candy_map = this.createCandyMap(20, 4 ,7);
    },

    start () {
        // console.log(this.createCandyMap(3, 4 , 6));
        
    },

    update (dt) {
        let bg = this.addBg();
        this.addBgCandy(bg);
        this.reduceBg();
    },

    //初始化糖果
    initCandy() {
        let text_num = 0;
        let createCandyLabel = (sup, text) => {
            let node = new cc.Node();
            let com = node.addComponent(cc.Label);
            let position = text_num % 2 == 0 ? 90 : -90;
            node.setPosition(position, 0);
            sup.addChild(node);
            com.string = text;
            text_num++;
        }
        let createCandy = (x, y, type, text, sub = 0) => {
            let node = cc.instantiate(this.candy);
            this.node.children[sub].addChild(node);
            let candy = node.getComponent('candy');
            candy.init(x, y, type);
            createCandyLabel(node, text);
        }
        createCandy(200, 100, 'deduct', '扣分');
        createCandy(-200, -500, 'increase', '加分');
        createCandy(0, 400, 'quicken', '加速', 1);
        createCandy(0, -400, 'slow', '减速', 1);
    },

    //增加背景
    addBg() {
        let ball_y = this.ball.y;
        if (ball_y - this.canvas.height < -this.node.height && this.bg_count > 0) {
            let index = this.insert_bg_num % 2;
            let bg = cc.instantiate(this.bg_list[index]);
            bg.y = -bg.height * (2.5 + this.insert_bg_num);
            this.node.addChild(bg);
            this.node.height += bg.height;
            this.bg_count--;
            this.insert_bg_num++;
            return bg;
        }
        // console.log("bg:", this.node.height);
        // console.log(this.node.children);
    },

    //减少已经经过的背景
    reduceBg() {
        let ball_y = this.ball.y;
        this.node.children.forEach(node => {
            if (ball_y < node.y - node.height * 2) {
                // node.removeFromParent();
                node.destroy();
            }
        });
    },

    //添加背景内糖果
    addBgCandy(bg) {
        if (!bg) {
            return;
        }
        let createCandy = (candy) => {
            if (candy.bg === this.insert_bg_num) {
                let candy_node = cc.instantiate(this.candy);
                bg.addChild(candy_node);
                candy_node = candy_node.getComponent('candy');
                candy_node.init(candy.x, candy.y, candy.type);
            }
        }
        for (let candy of this.candy_map) {
            createCandy(candy);
        }
    },

    createCandyMap(bg, min, max) {
        let candy_map = [];
        let bg_num = 1;
        let getMiddleValue = (min, max) => {
            return Math.ceil(Math.random() * (max - min)) + min;
        }
        for (let i = 0; i < bg; i++, bg_num++) {
            let count = getMiddleValue(min, max);
            for (let j = 0; j < count; j++) {
                let candy = {};
                candy.bg = bg_num;
                let x = getMiddleValue(-440, 440);
                let y = getMiddleValue(-440, 440);
                candy.x = x;
                candy.y = y;
                let random = Math.random();
                let type = random <= 0.6 ? (random <= 0.25 ? 'deduct' : 'increase') : (random >= 0.8 ? 'quicken' : 'slow');
                candy.type = type;
                candy_map.push(candy);
            }
        }
        return candy_map;
    }
});
