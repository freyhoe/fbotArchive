//const { MessageChannel, parentPort }= require('worker_threads');//for node.js testing only

let botSettings = {pathWeight:0, useHold:true}
let gameSettings = {lineClip:true, rows:40, cols:10}
class Game{
  constructor(){
    this.rows= gameSettings.rows
    this.cols = gameSettings.cols
    this.offsets= {
        "JLSTZ": {
          north:{
              'cw': [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, -2],
                  [1, -2]
              ],
              'ccw': [
                  [0, 0],
                  [-1, 0],
                  [-1, 1],
                  [0, -2],
                  [-1, -2]
              ],
              '180': [
                  [0, 0],
                  [0, 1]
              ]
          }, east:{
              'ccw': [
                  [0, 0],
                  [1, 0],
                  [1, -1],
                  [0, 2],
                  [1, 2]
              ],
              'cw': [
                  [0, 0],
                  [1, 0],
                  [1, -1],
                  [0, 2],
                  [1, 2]
              ],
              '180': [
                  [0, 0],
                  [1, 0]
              ]
          }, south:{
              'ccw': [
                  [0, 0],
                  [-1, 0],
                  [-1, 1],
                  [0, -2],
                  [-1, -2]
              ],
              'cw': [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, -2],
                  [1, -2]
              ],
              '180': [
                  [0, 0],
                  [0, -1]
              ]
          }, west:{
              'ccw': [
                  [0, 0],
                  [-1, 0],
                  [-1, -1],
                  [0, 2],
                  [-1, 2]
              ],
              'cw': [
                  [0, 0],
                  [-1, 0],
                  [-1, -1],
                  [0, 2],
                  [-1, 2]
              ],
              '180': [
                  [0, 0],
                  [-1, 0]
              ]
          }
        },//last 2 kicks should be fin/neo tspin mini override
        "I": {
          north:{
            ccw: [
                [0, 0],
                [-1, 0],
                [2, 0],
                [-1, 2],
                [2, -1]
            ],
            cw: [
                [0, 0],
                [-2, 0],
                [1, 0],
                [-2, -1],
                [1, 2]
            ],
            '180': [
                [0, 0],
                [0, 1]
            ]
        },
          east:{
            ccw: [
                [0, 0],
                [2, 0],
                [-1, 0],
                [2, 1],
                [-1, -2]
            ],
            cw: [
                [0, 0],
                [-1, 0],
                [2, 0],
                [-1, 2],
                [2, -1]
            ],
            '180': [
                [0, 0],
                [1, 0]
            ]
        },
          south:{
            ccw: [
                [0, 0],
                [1, 0],
                [-2, 0],
                [1, -2],
                [-2, 1]
            ],
            cw: [
                [0, 0],
                [2, 0],
                [-1, 0],
                [2, 1],
                [-1, -2]
            ],
            '180': [
                [0, 0],
                [0, -1]
            ]
        },
          west:{
            ccw: [
                [0, 0],
                [-2, 0],
                [1, 0],
                [-2, -1],
                [1, 2]
            ],
            cw: [
                [0, 0],
                [1, 0],
                [-2, 0],
                [1, -2],
                [-2, 1]
            ],
            '180': [
                [0, 0],
                [-1, 0]
            ]
        },
        },
        "O": {
          north:{
              ccw: [
                  [0, 0]
              ],
              cw: [
                  [0, 0]
              ],
              '180': [
                  [0, 0]
              ]
          },
          east:{
              ccw: [
                  [0, 0]
              ],
              cw: [
                  [0, 0]
              ],
              '180': [
                  [0, 0]
              ]
          },
          south:{
              ccw: [
                  [0, 0]
              ],
              cw: [
                  [0, 0]
              ],
              '180': [
                  [0, 0]
              ]
          },
          west:{
              ccw: [
                  [0, 0]
              ],
              cw: [
                  [0, 0]
              ],
              '180': [
                  [0, 0]
              ]
          },
        }
    }
    this.shapes= {
        "J": {
            "coords":{
              north: [ [ -1, 1 ], [ -1, 0 ], [ 0, 0 ], [ 1, 0 ] ] ,
              east: [ [ 1, 1 ], [ 0, 1 ], [ 0, -0 ], [ 0, -1 ] ] ,
              south: [ [ 1, -1 ], [ 1, -0 ], [ -0, -0 ], [ -1, -0 ] ] ,
              west: [ [ -1, -1 ], [ -0, -1 ], [ -0, 0 ], [ -0, 1 ] ] ,
            },
            "spawn": [4, 19],
            "offsets": this.offsets.JLSTZ
        },
        "L": {
            "coords": {
              north: [ [ 1, 1 ], [ -1, 0 ], [ 0, 0 ], [ 1, 0 ] ] ,
              east: [ [ 1, -1 ], [ 0, 1 ], [ 0, -0 ], [ 0, -1 ] ] ,
              south: [ [ -1, -1 ], [ 1, -0 ], [ -0, -0 ], [ -1, -0 ] ] ,
              west: [ [ -1, 1 ], [ -0, -1 ], [ -0, 0 ], [ -0, 1 ] ] ,
            },
            "spawn": [4, 19],
            "offsets": this.offsets.JLSTZ
        },
        "T": {
            "coords":{
              north: [ [ 0, 1 ], [ -1, 0 ], [ 0, 0 ], [ 1, 0 ] ] ,
              east: [ [ 1, -0 ], [ 0, 1 ], [ 0, -0 ], [ 0, -1 ] ] ,
              south: [ [ -0, -1 ], [ 1, -0 ], [ -0, -0 ], [ -1, -0 ] ] ,
              west: [ [ -1, 0 ], [ -0, -1 ], [ -0, 0 ], [ -0, 1 ] ] ,
            },
            "backCorners":{
              north: [ [ -1, -1 ], [ 1, -1 ] ] ,
              east: [ [ -1, 1 ], [ -1, -1 ] ] ,
              south: [ [ 1, 1 ], [ -1, 1 ] ] ,
              west: [ [ 1, -1 ], [ 1, 1 ] ] ,
            }, //corners to check for tspin rule
            "frontCorners":{
              north: [ [ 1, 1 ], [ -1, 1 ] ] ,
              east: [ [ 1, -1 ], [ 1, 1 ] ] ,
              south: [ [ -1, -1 ], [ 1, -1 ] ] ,
              west: [ [ -1, 1 ], [ -1, -1 ] ] ,
            },
            "spawn": [4, 19],
            "offsets": this.offsets.JLSTZ
        },
        "S": {
            "coords":{
              north: [ [ -1, 0 ], [ 0, 0 ], [ 0, 1 ], [ 1, 1 ] ] ,
              east: [ [ 0, 1 ], [ 0, -0 ], [ 1, -0 ], [ 1, -1 ] ] ,
              south: [ [ 1, -0 ], [ -0, -0 ], [ -0, -1 ], [ -1, -1 ] ] ,
              west: [ [ -0, -1 ], [ -0, 0 ], [ -1, 0 ], [ -1, 1 ] ] ,
            },
            "spawn": [4, 19],
            "offsets": this.offsets.JLSTZ
        },
        "Z": {
            "coords":{
              north: [ [ 1, 0 ], [ 0, 0 ], [ 0, 1 ], [ -1, 1 ] ] ,
              east: [ [ 0, -1 ], [ 0, -0 ], [ 1, -0 ], [ 1, 1 ] ] ,
              south: [ [ -1, -0 ], [ -0, -0 ], [ -0, -1 ], [ 1, -1 ] ] ,
              west: [ [ -0, 1 ], [ -0, 0 ], [ -1, 0 ], [ -1, -1 ] ] ,
            },
            "spawn": [4, 19],
            "offsets": this.offsets.JLSTZ
        },
        "I": {
            "coords":{
              north: [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 2, 0 ] ] ,
              east: [ [ 0, 1 ], [ 0, -0 ], [ 0, -1 ], [ 0, -2 ] ] ,
              south: [ [ 1, -0 ], [ -0, -0 ], [ -1, -0 ], [ -2, -0 ] ] ,
              west: [ [ -0, -1 ], [ -0, 0 ], [ -0, 1 ], [ -0, 2 ] ] ,
            },
            "spawn": [4, 19],
            "offsets": this.offsets.I
        },
        "O": {
            "coords": {
              north: [ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ] ] ,
              east: [ [ 0, -0 ], [ 0, -1 ], [ 1, -0 ], [ 1, -1 ] ] ,
              south: [ [ -0, -0 ], [ -1, -0 ], [ -0, -1 ], [ -1, -1 ] ] ,
              west: [ [ -0, 0 ], [ -0, 1 ], [ -1, 0 ], [ -1, 1 ] ] ,
            },
            "spawn": [4, 19],
            "offsets": this.offsets.O
        }

    }
    this.rotation = {
      'north': {
          '180': 'south',
          'cw': 'east',
          'ccw': 'west',
      },
      'east': {
          '180': 'west',
          'cw': 'south',
          'ccw': 'north',
      },
      'south': {
          '180': 'north',
          'cw': 'west',
          'ccw': 'east',
      },
      'west': {
          '180': 'east',
          'cw': 'north',
          'ccw': 'south',
      },
    }
    this.weights = {
      rowTrans: -5,
      covered: -17,
      covered2: -1,
      bumpiness: -24,
      bumpiness2: -7,
      cavities: -173,
      cavities2: -3,
      overhangs: -34,
      overhangs2: -1,
      tslot: [8, 148, 192, 407],
      depth: 57,
      max_well_depth: 17,
      well: [-30, -50, 20, 50, 60, 60, 50, 20, -50, -30],
      height:-46,
      half:-150,
      quarter:-511,
      b2b:52,

      clears:[0,-143,-100,-58,390],
      b2bClear:104,
      tspin1: 121,
      tspin2: 410,
      tspin3: 602,
      miniTspin1: -158,
      miniTspin2: -93,
      tWaste:-152,
      combo:150,
    }
    this.hdMoves = {
      "T":[[3,0,'north'],[2,0,'north'],[1,0,'north'],[4,0,'north'],[5,0,'north'],[6,0,'north'],[7,0,'north'],[8,0,'north'],[3,1,'east'],[2,1,'east'],[1,1,'east'],[0,1,'east'],[4,1,'east'],[5,1,'east'],[6,1,'east'],[7,1,'east'],[8,1,'east'],[3,1,'west'],[2,1,'west'],[1,1,'west'],[4,1,'west'],[5,1,'west'],[6,1,'west'],[7,1,'west'],[8,1,'west'],[9,1,'west'],[3,1,'south'],[2,1,'south'],[1,1,'south'],[4,1,'south'],[5,1,'south'],[6,1,'south'],[7,1,'south'],[8,1,'south']],
      "O":[[3,0,'north'],[2,0,'north'],[1,0,'north'],[0,0,'north'],[4,0,'north'],[5,0,'north'],[6,0,'north'],[7,0,'north'],[8,0,'north']],
      "I":[[3,0,'north'],[2,0,'north'],[1,0,'north'],[4,0,'north'],[5,0,'north'],[6,0,'north'],[7,0,'north'],[3,2,'east'],[2,2,'east'],[1,2,'east'],[0,2,'east'],[4,2,'east'],[5,2,'east'],[6,2,'east'],[7,2,'east'],[8,2,'east'],[9,2,'east'],[3,1,'west'],[2,1,'west'],[1,1,'west'],[0,1,'west'],[4,1,'west'],[5,1,'west'],[6,1,'west'],[7,1,'west'],[8,1,'west'],[9,1,'west'],[3,0,'south'],[2,0,'south'],[4,0,'south'],[5,0,'south'],[6,0,'south'],[7,0,'south'],[8,0,'south']],
      "L":[[3,0,'north'],[2,0,'north'],[1,0,'north'],[4,0,'north'],[5,0,'north'],[6,0,'north'],[7,0,'north'],[8,0,'north'],[3,1,'east'],[2,1,'east'],[1,1,'east'],[0,1,'east'],[4,1,'east'],[5,1,'east'],[6,1,'east'],[7,1,'east'],[8,1,'east'],[3,1,'west'],[2,1,'west'],[1,1,'west'],[4,1,'west'],[5,1,'west'],[6,1,'west'],[7,1,'west'],[8,1,'west'],[9,1,'west'],[3,1,'south'],[2,1,'south'],[1,1,'south'],[4,1,'south'],[5,1,'south'],[6,1,'south'],[7,1,'south'],[8,1,'south']],
      "J":[[3,0,'north'],[2,0,'north'],[1,0,'north'],[4,0,'north'],[5,0,'north'],[6,0,'north'],[7,0,'north'],[8,0,'north'],[3,1,'east'],[2,1,'east'],[1,1,'east'],[0,1,'east'],[4,1,'east'],[5,1,'east'],[6,1,'east'],[7,1,'east'],[8,1,'east'],[3,1,'west'],[2,1,'west'],[1,1,'west'],[4,1,'west'],[5,1,'west'],[6,1,'west'],[7,1,'west'],[8,1,'west'],[9,1,'west'],[3,1,'south'],[2,1,'south'],[1,1,'south'],[4,1,'south'],[5,1,'south'],[6,1,'south'],[7,1,'south'],[8,1,'south']],
      "S":[[3,0,'north'],[2,0,'north'],[1,0,'north'],[4,0,'north'],[5,0,'north'],[6,0,'north'],[7,0,'north'],[8,0,'north'],[3,1,'east'],[2,1,'east'],[1,1,'east'],[0,1,'east'],[4,1,'east'],[5,1,'east'],[6,1,'east'],[7,1,'east'],[8,1,'east'],[3,1,'west'],[2,1,'west'],[1,1,'west'],[4,1,'west'],[5,1,'west'],[6,1,'west'],[7,1,'west'],[8,1,'west'],[9,1,'west'],[3,1,'south'],[2,1,'south'],[1,1,'south'],[4,1,'south'],[5,1,'south'],[6,1,'south'],[7,1,'south'],[8,1,'south']],
      "Z":[[3,0,'north'],[2,0,'north'],[1,0,'north'],[4,0,'north'],[5,0,'north'],[6,0,'north'],[7,0,'north'],[8,0,'north'],[3,1,'east'],[2,1,'east'],[1,1,'east'],[0,1,'east'],[4,1,'east'],[5,1,'east'],[6,1,'east'],[7,1,'east'],[8,1,'east'],[3,1,'west'],[2,1,'west'],[1,1,'west'],[4,1,'west'],[5,1,'west'],[6,1,'west'],[7,1,'west'],[8,1,'west'],[9,1,'west'],[3,1,'south'],[2,1,'south'],[1,1,'south'],[4,1,'south'],[5,1,'south'],[6,1,'south'],[7,1,'south'],[8,1,'south']],
    }
    let TSDR = (matrix, heights, start)=>{
      if(heights[start+1]>heights[start+2])return false
      if(heights[start]<heights[start+2]+1)return false
      let match = [
        [true,false,false],
        [false,false,false],
        [true,false,true],]
      let y = heights[start+2]+1
      if(y<2)return false
      for(let dy = 0; dy< match.length; dy++){
        for(let dx = 0; dx< match[0].length; dx++){
          if(match[dy][dx]!=(!!matrix[y-dy][start+dx]))return false
        }
      }
      return this.initPiece("T",start+1,y-1,"south")

    }
    let TSDL = (matrix, heights, start)=>{
      if(heights[start+1]>heights[start])return false
      if(heights[start+2]<heights[start]+1)return false
      let match = [
        [false,false,true],
        [false,false,false],
        [true,false,true],]
      let y = heights[start]+1
      if(y<2)return false
      for(let dy = 0; dy< match.length; dy++){
        for(let dx = 0; dx< match[0].length; dx++){
          if(match[dy][dx]!=(!!matrix[y-dy][start+dx]))return false
        }
      }
      return this.initPiece("T",start+1,y-1,"south")
    }
    let TSTL = (matrix, heights, start)=>{
      if(heights[start]!=heights[start+2]-2)return false
      if(heights[start+1]!=heights[start+2]-2)return false
      let match = [
        [false,false,true],
        [false,false,false],
        [true,true,false],
        [true,false,false],
        [true,null,false],
      ]
      let y = heights[start]+1
      if(y<4)return false
      if(matrix[y-1][start-1]){
        if(!matrix[y][start-1])return false
      }
      for(let dy = 0; dy< match.length; dy++){
        for(let dx = 0; dx< match[0].length; dx++){
          if(match[dy][dx]!=null && match[dy][dx]!=(!!matrix[y-dy][start+dx]))return false
        }
      }
      return this.initPiece("T",start+2,y-2,"west")
    }
    let TSTR = (matrix, heights, start)=>{
      if(heights[start+2]!=heights[start]-2)return false
      if(heights[start+1]!=heights[start]-2)return false
      let match = [
        [true,false,false],
        [false,false,false],
        [false,true,true],
        [false,false,true],
        [false,null,true],
      ]
      let y = heights[start+2]+1
      if(y<4)return false
      if(matrix[y-1][start+3]){
        if(!matrix[y][start+3])return false
      }
      for(let dy = 0; dy< match.length; dy++){
        for(let dx = 0; dx< match[0].length; dx++){
          if(match[dy][dx]!=null && match[dy][dx]!=(!!matrix[y-dy][start+dx]))return false
        }
      }
      return this.initPiece("T",start,y-3,"east")
    }
    this.TSLOTS = [TSDR,TSDL,TSTL,TSTR]
  }
  getHeights(board){
    let heights = []
    for(let x = 0; x < this.cols; x++){
      let h = 0
      for(; h<this.rows;h++){
        if(board[this.rows-1-h][x])break
      }
      heights.push(this.rows-h)
    }
    return heights
  }
  checkTspin(matrix,piece){
    if(piece.location.type!="T")return "none"
    let last = piece.fbot.actions[piece.fbot.actions.length-1]
    if(last!="cw" && last !="ccw" && last != "180")return "none"
    let backCorners = this.shapes.T.backCorners[piece.location.orientation]
    let frontCorners = this.shapes.T.frontCorners[piece.location.orientation]
    let fCount =0
    let bCount =0
    for(let [dx,dy] of backCorners){
      bCount+=(!!this.getBoardCell(matrix,piece.location.x+dx,piece.location.y+dy))
    }
    for(let [dx,dy] of frontCorners){
      fCount+=(!!this.getBoardCell(matrix,piece.location.x+dx,piece.location.y+dy))
    }
    if(frontCorners + backCorners<3)return "none"
    if(fCount<2&&piece.fbot.kick<=2)return "mini"
    return "full"

  }
  simulateRot(matrix,move,rot){
    let kicks = this.shapes[move.location.type].offsets[move.location.orientation][rot]
    let r1 = this.rotation[move.location.orientation][rot]
    for(let i =0; i < kicks.length; i++){
      let [x,y] = kicks[i]
      let test = this.copyMove(move)
      test.location.x+=x
      test.location.y+=y
      test.location.orientation = r1
      test.fbot.actions.push(rot)
      if(!this.checkIntersection(matrix,test))return test
    }
    return false
  }
  simulateTrans(matrix,move,x,y,act=null){
    move.location.x+=x
    move.location.y+=y
    if(act)move.fbot.actions.push(act)
    if(this.checkIntersection(matrix,move)){return false}
    return move
  }
  simulateAction(matrix, move, action){
    let newMove = this.copyMove(move)
    switch(action){
      case '<':return this.simulateTrans(matrix,newMove,-1,0,action)
      case '>':return this.simulateTrans(matrix,newMove,1,0,action)
      case '<<':
      case '>>':
        let dir = 1
        if(action=='<<')dir = -1
        let das = this.simulateTrans(matrix,newMove,dir,0,action)
        if(!das)return false
        while(!this.checkIntersection(matrix,das)){
          das.location.x+=dir
        }
        das.location.x-=dir
        if(das.location.x==move.location.x)return false
        das.fbot.actions.push(action)
        return das
      case 'sd':
        let sd = this.simulateTrans(matrix,newMove,0,-1,action)
        if(!sd)return false
        while(!this.checkIntersection(matrix,sd)){
          sd.location.y-=1
        }
        sd.location.y+=1
        if(sd.location.y==move.location.y)return false
        sd.fbot.actions.push("sd")
        return sd
      case 'ssd':
        let ssd = this.simulateTrans(matrix,newMove,0,-1,action)
        return ssd
      case 'cw':
      case 'ccw':
      case '180':
      return this.simulateRot(matrix,move,action)
    }
  }
  initPiece(type,x,y,o){
    return{
      location:{
        type:type,
        orientation:o||"north",
        x:x||this.shapes[type].spawn[0],
        y:y||this.shapes[type].spawn[1],
      },
      spin:"none",
      fbot:{
        score:0,
        actions:[],
        kick:-1,
        attackType:this.attackType(),
      }
    }
  }
  placePiece(matrix,piece){
    for(let [dx, dy] of this.shapes[piece.location.type].coords[piece.location.orientation]){
      let x = piece.location.x+dx, y = piece.location.y+dy
      if(x>=0&&x<this.cols&&y>=0 && y< this.rows){
        matrix[y][x] = piece.location.type
      }
    }
  }
  initState(){
    let board =Array.from({ length: this.rows }, () => Array.from({ length: this.cols }, () => null));
    let hold = null
    let queue = ["I","O","T","L","J","S","Z","I","O","T","L","J","S","Z","I","O","T","L","J","S","Z",]
    let combo = 0
    let back_to_back = false
    return {board:board,hold:hold,combo:combo,queue:queue,back_to_back:back_to_back}
  }
  copyState(state){
    let board = [];
    for (let i = 0; i < this.rows; i++)
      board[i] = state.board[i].slice();
    return {board:board, hold:state.hold, combo:state.combo, back_to_back:state.back_to_back}
  }


  getKicks(type,rotation,spin){
    let r0 = rotation
    let r1 = this.rotation[rotation][spin]
    let offsets = this.shapes[type].offsets
    let kicks = []
    for (let i = 0; i<offsets.north.length;i++){
      let [x0, y0] = offsets[r0][i];
      let [x1, y1] = offsets[r1][i];
      kicks.push({
          x: x0 - x1,
          y: y0 - y1,
          r: r1,
      })
    }
    return kicks
  }
  checkIntersection(matrix,piece){
    for(let [dx, dy] of this.shapes[piece.location.type].coords[piece.location.orientation]){
      if(this.getBoardCell(matrix,piece.location.x+dx,piece.location.y+dy))return true
    }
    return false
  }
  getBoardCell(matrix,x,y){
    if(x<0||x>=this.cols||y<0)return 'X'
    else if(y>= this.rows)return null
    else return matrix[y][x]
  }
  getMoves(state,start){
    if(!start)return []
    let moves = new Map()
    let explored = new Map()
    let branchActions = ['<','>','cw','ccw','sd','180']
    if(start == "O")branchActions = ['<','>','sd']
    let inverseActions = {'<':'>', '>':'<', 'ccw':'cw', 'cw':'ccw', '180':'180', 'sd':'sd'}
    let base = []
    start = this.initPiece(start)
    let leftMost = this.simulateAction(state.board,start,"<")
    if(leftMost){
    while(!this.checkIntersection(state.board,leftMost)){
      let p = this.simulateAction(state.board,leftMost,'sd')
      if(!p)return []
      let str = p.location.x + " " + p.location.y + " " + p.location.orientation
      base.push(p)
      explored.set(str,true)
      moves.set(str,p)
      leftMost.location.x-=1
    }}
    leftMost = this.copyMove(start)
    while(!this.checkIntersection(state.board,leftMost)){
      let p = this.simulateAction(state.board,leftMost,'sd')
      if(!p)return []
      let str = p.location.x + " " + p.location.y + " " + p.location.orientation
      base.push(p)
      explored.set(str,true)
      moves.set(str,p)
      leftMost.location.x+=1
    }
    let depth = 10
    while(depth>0){
      depth-=1
      let push = []
      for(let piece of base){
        for(let action of branchActions){
          if(inverseActions[piece.fbot.actions[piece.fbot.actions.length-1]]==action)continue
          let newPiece = this.simulateAction(state.board,piece,action)
          if(newPiece){
            let str = newPiece.location.x + " " + newPiece.location.y + " " + newPiece.location.orientation
            if(!explored.has(str)){
              explored.set(str,true)
              push.push(newPiece)
              newPiece.location.y-=1
              if(this.checkIntersection(state.board,newPiece)){
                newPiece.location.y+=1
                moves.set(str,newPiece)
              }
              else{
                newPiece.location.y+=1
              }
            }
          }
        }
      }
      base = push
      if(base.length==0)break
    }
    return(Array.from(moves.values()))
  }

  copyMove(move){
    return {spin:move.spin,location:{...move.location},fbot:{score:move.fbot.score,actions:[...move.fbot.actions],kick:move.fbot.kick,attackType:{...move.fbot.attackType}}}
  }
  advanceState(pushState,move,depth){
    let state = this.copyState(pushState)
    let cleared = 0
    let colorCleared = 0
    let garbageCleared = 0
    this.placePiece(state.board,move)
    for(let y=0; y<state.board.length; y++){
      if(!state.board[y].includes(null)){
        if(state.board[y][0]=="G" || state.board[y][1]=="G")garbageCleared+=1
        else{colorCleared+=1}
        state.board.splice(y,1)
        y--
        cleared++
      }
    }
    if(cleared>0)move.spin= this.checkTspin(state.board,move)
    for(let i = 0; i < cleared; i++){
      state.board.push(Array.from({ length: this.cols}, () => null))
    }

    if(state.combo>0){
      if(cleared>0)state.combo+=1
      else state.combo = 0
    }
    move.fbot.attackType.combo=state.combo
    move.fbot.attackType.clear = cleared
    move.fbot.attackType.g=garbageCleared
    if(cleared>=4 || (move.spin!="none"&& cleared>0)){
      if(state.back_to_back)move.fbot.attackType.back_to_back=true
      state.back_to_back = true
    }
    if(move.location.type==state.hold){
      state.hold = bot.queue[depth]
    }
    else if(move.location.type==bot.queue[depth]){
    }
    else if(state.hold==null && bot.queue[depth+1]==move.location.type){
      state.hold = bot.queue[depth]
    }
    depth+=1
    if(bot.queue[depth]){
      let spawn = this.initPiece(bot.queue[depth])
      if(this.checkIntersection(state.board,spawn)){
        spawn.y+=1
        if(this.checkIntersection(state.board,spawn)){
          spawn.y+=1
          if(this.checkIntersection(state.board,spawn)){
            state.dead = true
          }
        }
      }
      let lowest = 0
      for(let [dx,dy] of this.shapes[spawn.location.type].coords["north"]){
        if(dy<lowest)lowest = dy
      }
      if(move.location.y+lowest>19){
        state.dead = true
      }
    }
    return state
  }
  tslot(board, heights, count, scores = []){
    for(let i = 0; i < this.cols-3; i++){
      for(let slot of this.TSLOTS){
        let cry = slot(board,heights,i)
        if(cry){
          this.placePiece(board,cry)
          let cleared = 0
          for(let y=0; y<board.length; y++){
            if(!board[y].includes(null)){
              board.splice(y,1)
              y--
              cleared++
            }
          }
          for(let i = 0; i < cleared; i++){
            board.push(Array.from({ length: this.cols}, () => null))
          }
          scores.push(cleared)
          let heights = this.getHeights(board)
          if(count-1==0)return [board,scores,heights]
          return this.tslot(board,heights,count-1,scores)
        }
      }
    }
    return [board,scores,heights]
  }
  scoreState(state, move,depth,weights){
    let score = 0
    let board = [];
    for (let i = 0; i < this.rows; i++)
      board[i] = state.board[i].slice();
    weights = weights || this.weights
    let tCount = 0
    for(let i = depth; i < 5+depth; i++){
      if(bot.queue[i]){
        if(bot.queue[i]=="T")tCount++
      }
      else{
        break
      }
    }
    if(state.hold == "T")tCount++
    let heights = this.getHeights(board)
    if(tCount > 0){
      let out = this.tslot(board,heights,tCount)
      board = out[0]
      for(let slot of out[1]){
        score+=weights.tslot[slot]
      }
      heights = out[2]
    }
    let maxHeight = Math.max(...heights)
    let row_transitions = 0
    for(let y = 0; y<this.rows; y++){
      let last = true
      for(let i = 0; i <= this.cols; i++){
        if(!!this.getBoardCell(board,i,y) != last){
          row_transitions++
          last = !!board[y][i]
        }
      }
    }
    score+=weights.rowTrans*row_transitions

    let covered = 0;
    let covered2 = 0
    for(let x = 0; x < this.cols; x++){
      for(let y = heights[x]-2; y>=0; y--){
        if(!board[y][x]){
          let cells = Math.min(6,heights[x]-y-1)
          covered+=cells
          covered2+=cells*cells
        }
      }
    }
    score+=weights.covered*covered+weights.covered2*covered2

    let cavities = 0
    let overhangs = 0
      for(let y=0; y<maxHeight;y++){
        for(let x = 0; x < this.cols; x++){
          if(board[y][x]||y>=heights[x])continue
          if(x>1){
            if(heights[x-1]<=y-1&&heights[x-2]<=y){
              overhangs+=1
              continue
            }
          }
          if(x<8){
            if(heights[x+1]<=y-1&&heights[x+2]<=y){
              overhangs+=1
              continue
            }
          }
          cavities+=1
        }
      }
    score += cavities * weights.cavities + overhangs*weights.overhangs2

    let well = 0
    for(let x = 0; x < this.cols; x++){
      if(heights[x]<=heights[well])well = x
    }
    let depth1 = 0
    loop1:for(let y = heights[well]; y<this.rows; y++){
      for(let x = 0; x < this.cols; x++){
        if(x!=well && !board[y][x]){
          break loop1
        }
      }
      depth1++
    }
    score+=depth1*weights.depth
    if(depth!=0 && weights.well[well])score+=weights.well[well]
    let bumpiness = -1
    let bumpiness2 = -1
    let prev = 0
    if(well==0)prev=1
    for(let i = 1; i < 10; i ++){
      if(i==well)continue
      let dh = Math.abs(heights[prev]-heights[i])
      bumpiness+=dh
      bumpiness2+=dh*dh
      prev=i
    }
    score+=weights.bumpiness*bumpiness + weights.bumpiness2*bumpiness2
    score+=maxHeight*weights.height + Math.max(0,maxHeight-15)*weights.quarter + Math.max(0,maxHeight-10)*weights.half
    if(state.back_to_back)score+=weights.b2b
    if(move.location.type == "T" && move.spin != "none"){
      switch (move.fbot.attackType.clear) {
        case 0:
          move.fbot.score+=weights.tWaste
          break;
        case 1:
          if(move.spin=='mini')move.fbot.score+=weights.miniTspin1
          else{move.fbot.score+=weights.tspin1}
        case 2:
          if(move.spin=='mini')move.fbot.score+=weights.miniTspin2
          else{move.fbot.score+=weights.tspin2}
        default:
          move.fbot.score+= weights.tspin3
      }
      if(move.fbot.attackType.clear!=0)move.fbot.score+=weights.b2bClear
    }
    else{
      move.fbot.score += weights.clears[move.fbot.attackType.clear]
      if(move.fbot.attackType.clear>=4)move.fbot.score+=weights.b2bClear
    }
    move.fbot.score+=move.fbot.attackType.combo*weights.combo
  //  move.fbot.score+=move.fbot.actions.length*(-10)
    return score
  }

  attackType(cCleared=0,gCleared=0,b2b=false,combo=0){
    return {clear:cCleared+gCleared,g:gCleared,back_to_back:b2b,combo:combo}
  }
  printBoard(board){
      let chars = []
      for(let i =board.length-1;i>=0;i--){
          for(let s of board[i]){
              if(s==null)chars.push("* ")
              else chars.push(s+" ")
          }
          chars.push("\n")
      }
      return chars.join("")
  }
}
let nodesCreated = 0
class Node{
  constructor(parent=null, move = null, state = null, value = 0){
    this.parent = parent
    this.state = state
    this.move = move
    if(this.parent){this.depth = this.parent.depth+1}
    if(!this.depth)this.depth = 0
    this.value = value
    this.children = []
    this.graveyard = [] //dead nodes
  }
  expand(weights = null){
    if(!this.state)return false
    let depth = this.depth+!!this.state.hold
    if(!bot.queue[depth])return false
    let moves = game.getMoves(this.state,bot.queue[depth])
    if(this.state.hold)moves = moves.concat(game.getMoves(this.state,this.state.hold))
    else if(bot.queue[depth+1]){
      moves = moves.concat(game.getMoves(this.state,bot.queue[depth+1]))
    }
    let dead = 0
    for(let move of moves){
      nodesCreated+=1
      let newState = game.advanceState(this.state,move,depth) // get next state and set the score of the move
      if(newState.dead){
        dead+=1
        this.graveyard.push(new Node(this, move))
      }
      else{
        let value = game.scoreState(newState,move,this.depth,weights) //get the score of the board
        let child = new Node(this, move, newState, value)
        this.children.push(child)
      }
    }

    if(this.children.length>0){
    //  this.state = null //this node is no longer a leaf node, we don't need its state using up space
      return true
    }
    else{
      return false
    }
  }
  backprop(){
    this.children.sort((a,b)=> (a.value < b.value)?1:-1)
    this.value = this.children[0].value+this.children[0].move.fbot.score
  //  this.value = this.value * botSettings.pathWeight + (1-botSettings.pathWeight)*(this.children[0].value + this.children[0].move.fbot.score) //we care about the board in the middle of the path, if we got a bad board in the middle the greater the chance we get killed by a unpredicted spike
    if(this.parent){this.parent.backprop()}
  }
  //not sure which selectChild is the best will test out
  selectChild(){
    //assume that children are already sorted
    let n = this.children.length
    let weights = []
    let sum = 0
    for(let i = 0; i<n; i++){
      sum+=1/((i+1)**2)
      weights[i]=1/((i+1)**2)
    }
    let index = 0
    let r = Math.random()*sum
    for(let j = 0; j<weights.length; j++){
      r-=weights[j]
      if(r<0){
        index = j
        j = weights.length
        }
      }
    return this.children[index]
  }
  selectChild2(){
    //assume that children are already sorted
    let sum = this.children.reduce((a,b)=>a+(b.value||0),0)
    let r = Math.random()*sum
    for(let j =0; j<this.children.length;j++){
      r-=this.children[j].value
      if(r<0)return this.children[j]
    }
    return this.children[0]
  }
  rollout(){

    if(this.children.length==0){//leaf node
      if(this.expand()){this.backprop()}
    }
    else{
      this.selectChild().rollout()
    }
  }
}

let game = new Game()
class Thinker{
  constructor(){
    this.calculating = true
    this.iters = 0
    this.maxIters = 3000
  }
  async run(){
    this.iters=0
    do{
      this.iters+=1
      bot.root.rollout()
      if(this.iters%50==0){
        await waitNextTask()
      }
    }
    while(this.iters<this.maxIters && this.calculating)
  }
}
class Bot{
  constructor(){
    this.root = null
    this.thinker = null
    this.queue = null
  }
  loadState(state){
    this.root = null
    this.queue = state.queue

    game.rows = state.board.length
    game.cols = state.board[0].length
    this.root = new Node(null,null,state)
    if(state.hold){
      this.root.depth-=1
    }
    this.root.rollout()
//    console.log(this.queue)
  //  console.log(this.root.state.hold)
  //  game.printBoard(state.board)
  }
  think(){
    if(this.thinker){
      this.stopThink()
    }
    this.thinker = new Thinker()
    this.thinker.run()
  }
  stopThink(){
    if(this.thinker)this.thinker.calculating = false
  }
  newPiece(piece){
    this.queue.push(piece)
  }

  processMove(move){
    if(!move)return
    for(let i = 0; i < this.root.children.length; i++){
      let check = this.root.children[i].move//check if we have move in tree, we should
      if(move.location.orientation == check.location.orientation && move.location.type == check.location.type && move.location.x == check.location.x && move.location.y == check.location.y){//spin doesnt matter, we get max possible spins anyway
        this.root = this.root.children[i]
        this.root.parent = null //patricide the old tree
        this.root.rollout()
    //    game.printBoard(this.root.state.board)
        return
      }
    }
    //cant find dupe move? shouldnt happen but just in case we load new state
  }
}


let bot = new Bot()

function waitNextTask() {
  return new Promise( (resolve) => {
    const channel = waitNextTask.channel || new MessageChannel();
    channel.port1.addEventListener("message", (evt) => resolve(), { once: true });
    channel.port2.postMessage("");
    channel.port1.start();
  });
}


function post(msg){
  postMessage(msg)
//  parentPort.postMessage(msg)
}
onmessage = function(e){
  let data = e.data
  switch(data.type){
    case "rules":
      post({type:"ready"})
      break
    case "start":
      let state = {hold:data.hold, queue:data.queue, combo:data.combo, back_to_back:data.back_to_back, board:data.board}
      bot.loadState(state)
      bot.think()
      break
    case "play":
      bot.processMove(data.move)
      bot.think()
      break
    case "suggest":
      if(bot.root.children.length==0){
        console.log("forceRolling")
        bot.root.rollout()
        console.log(bot.root)
      }
      console.log(bot.root)
      post({
        type:"suggestion",
        moves:bot.root.children.map(x=>x.move),
        move_info:{
          iters:bot.thinker.iters
        }
      })
      break
    case "new_piece":
      bot.newPiece(data.piece)
      break
    case "stop": case "quit":
      bot.stopThink()
      break

  }
}
//parentPort.on("message",message=>{
//  onmessage({data:message})
//})

post({
  type: "info",
  name: "FreyCat",
  author: "CatBot",
  version: "0.0",
  features: [],
});
