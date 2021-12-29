const jstrisToCenterX = [[1,2,2,1],[1,1,2,2],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]]
const jstrisToCenterY = [[1,1,2,2],[2,1,1,2],[2,2,2,2],[2,2,2,2],[2,2,2,2],[2,2,2,2],[2,2,2,2]]
const pIndex = ["I","O","T","L","J","S","Z"]
const rIndex = ["north","east","south","west"]
const reverseRIndex = {"north":0,"east":1,"south":2,"west":3}
const reversePIndex = {"I":0,"O":1,"T":2,"L":3,"J":4,"S":5,"Z":6}

const stats_copy ={ CLEAR1:0,
      CLEAR2:0,
      CLEAR3:0,
      CLEAR4:0,
      TSMS:0,
      TSS:0,
      TSD:0,
      TST:0,
      PC:0,
      WASTE:0,
      ATTACK:0,
      B2B:0,
      COMBO:0,
      CLEAN_RECIEVED:0,
      MESSY_RECIEVED:0,
    SPIKE:0,}

function TFstate(state_input){
  state_input = copyNState(state_input)
  let pushboard = state_input.board.slice(0,21).reverse()
  for(let r = 0 ; r<pushboard.length;r++){
    for(let c = 0; c < pushboard[r].length;c++){
      if(pushboard[r][c]==null)pushboard[r][c]=0
      else if (pushboard[r][c]=="G")pushboard[r][c]=8
      else{pushboard[r][c]= reversePIndex[pushboard[r][c]]+1}
    }
  }
  let deadline = pushboard.shift()
  let state = {matrix:pushboard,deadline:deadline, comboCounter:state_input.combo, isBack2Back:state_input.back_to_back, incomingGarbage:[], stats: {...stats_copy},queue:state_input.queue.map(x => new Block(reversePIndex[x])),currSpike:0, hold:{}}
  if(state_input.hold)state.hold = (new Block (reversePIndex[state_input.hold]))
  return state
}
function FTmove(ss){
  let move = {}
  move.type = pIndex[ss.piece.id]
  move.orientation = rIndex[ss.r]
  let x = jstrisToCenterX[ss.piece.id][ss.r]+ss.x
  let y = jstrisToCenterY[ss.piece.id][ss.r]+ss.y
  move.x = x
  move.y = 19-y
  return {location:move,spin:ss.spin}
}
function TFmove(ss){
  let spin = ss.spin
  let move = ss.location
  let r = reverseRIndex[move.orientation]
  let id = reversePIndex[move.type]
  let x = move.x-jstrisToCenterX[id][r]
  let y = (19-move.y)-jstrisToCenterY[id][r]
  return {x:x, y:y, r:r, piece:new Block(id),tcheck:false, spin:spin, actions:[]}
}
/*
function printBoard(board){
    let chars = []
    for(let b of board){
        for(let s of b){
            if(s==0)chars.push("* ")
            else chars.push("O ")
        }
        chars.push("\n")
    }
    console.log(chars.join(""))
}*/
function copyState(push){
  let state ={
      matrix : push.matrix.map(function(arr){return arr.slice();}),
      queue : [...push.queue],
      hold:{...push.hold},
      deadline:[...push.deadline],
      comboCounter: push.comboCounter,
      isBack2Back:push.isBack2Back,
      stats:{...push.stats},
      incomingGarbage:[...push.incomingGarbage],
      currSpike:push.currSpike
  }
  return state
}
function copyNState(push){
  let state ={
      board : push.board.map(function(arr){return arr.slice();}),
      queue : [...push.queue],
      combo: push.combo,
      back_to_back:push.back_to_back,
      hold: push.hold
  }
  return state
}
function columnHeight(grid,col){
    let r = 0
    for(; r<grid.length && grid[r][col]==0;r++);
    return grid.length-r;
}
function Game(){
  this.blockSets = getBlockSets()
  this.comboAttack = [0,0,1,1,1,2,2,3,3,4,4,4,5]
  this.linesAttack = [0, 0, 1, 2, 4, 4, 6, 2, 0, 10, 1]
  let tsdRIGHT = function(matrix, start){
      if(start+1>9)return false
      let h1 = columnHeight(matrix,start)
      let h2 = columnHeight(matrix,start+1)
      let h3 = columnHeight(matrix,start+2)
      if(!(h1>=h3+2))return false
      if(!(h3>=h2+1))return false
      let match = [[1,2,2],
                  [0,2,2],
                  [1,2,2]]
      let init_y = 20-h3-2
      for(let y = 0; y<3; y++){
          let y1 = init_y+y
          for(let x = 0; x<3; x++){
              let x1 = start+x
              if(match[y][x]>0!=matrix[y1][x1]>0 && match[y][x]!=2)return false
          }
      }
      return {x:start, y:init_y-1, r:2, piece:new Block(2), tcheck:true}
  }
  let tsdLEFT = function(matrix, start){
      if(start+1>9)return false
      let h3 = columnHeight(matrix,start)
      let h2 = columnHeight(matrix,start+1)
      let h1 = columnHeight(matrix,start+2)
      if(!(h1>=h3+2))return false
      if(!(h3>=h2+1))return false
      let match = [[2,2,1],
                  [2,2,0],
                  [2,2,1]]
      let init_y = 20-h3-2
      for(let y = 0; y<3; y++){
          let y1 = init_y+y
          for(let x = 0; x<3; x++){
              let x1 = start+x
              if(match[y][x]>0!=matrix[y1][x1]>0 && match[y][x]!=2)return false
          }
      }
      return {x:start, y:init_y-1, r:2, piece: new Block(2),tcheck:true}
  }
  let tstLEFT = function(matrix, start){
      if(start+2>9)return false
      let h1 = columnHeight(matrix,start)
      let h2 = columnHeight(matrix,start+1)
      let h3 = columnHeight(matrix,start+2)
      if(!(h1==h2))return false
      if(!(h3>=h2+2))return false
      if(!(h3>=5))return false
      let match = [[2,2,1],
                  [2,2,0],
                  [2,2,0],
                  [2,0,0],
                  [2,2,0]]

      let init_y = 20-h3
      if(matrix[init_y][start-1]!=matrix[init_y+1][start-1])return false
      for(let y = 0; y<3; y++){
          let y1 = init_y+y
          for(let x = 0; x<3; x++){
              let x1 = start+x
              if(match[y][x]>0!=matrix[y1][x1]>0 && match[y][x]!=2)return false
          }
      }
      return {x:start+1, y:init_y+1, r:3, piece: new Block(2),tcheck:true}
  }
  let tstRIGHT = function(matrix, start){
      if(start+2>9)return false
      let h3 = columnHeight(matrix,start)
      let h2 = columnHeight(matrix,start+1)
      let h1 = columnHeight(matrix,start+2)
      if(!(h3>=5))return false
      if(!(h1==h2))return false
      if(!(h3>=h2+2))return false
      let match = [[1,2,2],
                  [0,2,2],
                  [0,2,2],
                  [0,0,2],
                  [0,2,2]]

      let init_y = 20-h3
      if(matrix[init_y][start+3]!=matrix[init_y+1][start+3])return false
      for(let y = 0; y<3; y++){
          let y1 = init_y+y
          for(let x = 0; x<3; x++){
              let x1 = start+x
              if(match[y][x]>0!=matrix[y1][x1]>0 && match[y][x]!=2)return false
          }
      }
      return {x:start-1, y:init_y+1, r:1,piece: new Block(2),tcheck:true}
  }
  this.TSLOTS = [tsdRIGHT, tsdLEFT,tstLEFT,tstRIGHT]
}
function objCopy(_0xa670xb) {
      if(null == _0xa670xb || 'object' !== typeof _0xa670xb) {
          return _0xa670xb
      };
      var _0xa670x1d = {};
      for(var _0xa670x1e in _0xa670xb) {
          if(_0xa670xb['hasOwnProperty'](_0xa670x1e)) {
              _0xa670x1d[_0xa670x1e] = _0xa670xb[_0xa670x1e]
          }
      };
      return _0xa670x1d
  }
function Block(_0xa670x35) {
      this['id'] = _0xa670x35;
      this['set'] = 0;
      this['pos'] = {
          x: 3,
          y: 0
      };
      this['rot'] = 0;
      this['item'] = 0
  }
function BlockSet() {
      this['blocks'] = {};
      this['step'] = 1;
      this['scale'] = 1;
      this['items'] = false;
      this['previewAs'] = null;
      this['equidist'] = true;
      this['allspin'] = null
  }
function getBlockSets() {
      let _blockSets = null;
      if(_blockSets !== null) {
          return _blockSets
      };
      var _0xa670x51 = new BlockSet();
      _0xa670x51['items'] = true;
      var _0xa670x52 = [{
          '-1': [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, -2],
              [1, -2]
          ],
          '1': [
              [0, 0],
              [-1, 0],
              [-1, 1],
              [0, -2],
              [-1, -2]
          ],
          '2': [
              [0, 0],
              [0, 1]
          ]
      }, {
          '-1': [
              [0, 0],
              [1, 0],
              [1, -1],
              [0, 2],
              [1, 2]
          ],
          '1': [
              [0, 0],
              [1, 0],
              [1, -1],
              [0, 2],
              [1, 2]
          ],
          '2': [
              [0, 0],
              [1, 0]
          ]
      }, {
          '-1': [
              [0, 0],
              [-1, 0],
              [-1, 1],
              [0, -2],
              [-1, -2]
          ],
          '1': [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, -2],
              [1, -2]
          ],
          '2': [
              [0, 0],
              [0, -1]
          ]
      }, {
          '-1': [
              [0, 0],
              [-1, 0],
              [-1, -1],
              [0, 2],
              [-1, 2]
          ],
          '1': [
              [0, 0],
              [-1, 0],
              [-1, -1],
              [0, 2],
              [-1, 2]
          ],
          '2': [
              [0, 0],
              [-1, 0]
          ]
      }];
      var _0xa670x53 = [{
          '-1': [
              [0, 0],
              [-1, 0],
              [2, 0],
              [-1, +2],
              [2, -1]
          ],
          '1': [
              [0, 0],
              [-2, 0],
              [1, 0],
              [-2, -1],
              [1, 2]
          ],
          '2': [
              [0, 0],
              [0, 1]
          ]
      }, {
          '-1': [
              [0, 0],
              [2, 0],
              [-1, 0],
              [2, 1],
              [-1, -2]
          ],
          '1': [
              [0, 0],
              [-1, 0],
              [2, 0],
              [-1, 2],
              [2, -1]
          ],
          '2': [
              [0, 0],
              [1, 0]
          ]
      }, {
          '-1': [
              [0, 0],
              [1, 0],
              [-2, 0],
              [1, -2],
              [-2, 1]
          ],
          '1': [
              [0, 0],
              [2, 0],
              [-1, 0],
              [2, 1],
              [-1, -2]
          ],
          '2': [
              [0, 0],
              [0, -1]
          ]
      }, {
          '-1': [
              [0, 0],
              [-2, 0],
              [1, 0],
              [-2, -1],
              [1, 2]
          ],
          '1': [
              [0, 0],
              [1, 0],
              [-2, 0],
              [1, -2],
              [-2, 1]
          ],
          '2': [
              [0, 0],
              [-1, 0]
          ]
      }];
      var _0xa670x54 = [{
          '-1': [
              [0, 0]
          ],
          '1': [
              [0, 0]
          ],
          '2': [
              [0, 0]
          ]
      }, {
          '-1': [
              [0, 0]
          ],
          '1': [
              [0, 0]
          ],
          '2': [
              [0, 0]
          ]
      }, {
          '-1': [
              [0, 0]
          ],
          '1': [
              [0, 0]
          ],
          '2': [
              [0, 0]
          ]
      }, {
          '-1': [
              [0, 0]
          ],
          '1': [
              [0, 0]
          ],
          '2': [
              [0, 0]
          ]
      }];
      _0xa670x51['blocks'] = [{
          id: 0,
          name: 'I',
          color: 5,
          blocks: [
              [
                  [0, 0, 0, 0],
                  [1, 2, 3, 4],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 1, 0],
                  [0, 0, 2, 0],
                  [0, 0, 3, 0],
                  [0, 0, 4, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [4, 3, 2, 1],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 4, 0, 0],
                  [0, 3, 0, 0],
                  [0, 2, 0, 0],
                  [0, 1, 0, 0]
              ]
          ],
          cc: [0, 2, 0, 1],
          yp: [1, 1],
          spawn: [3, -1],
          kicks: _0xa670x53,
          h: [1, 4, 1, 4]
      }, {
          id: 1,
          name: 'O',
          color: 3,
          blocks: [
              [
                  [0, 0, 0, 0],
                  [0, 1, 2, 0],
                  [0, 3, 4, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 3, 1, 0],
                  [0, 4, 2, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 4, 3, 0],
                  [0, 2, 1, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 2, 4, 0],
                  [0, 1, 3, 0],
                  [0, 0, 0, 0]
              ]
          ],
          cc: [1, 1, 1, 1],
          yp: [1, 2],
          spawn: [3, -2],
          kicks: _0xa670x54,
          h: [2, 2, 2, 2]
      }, {
          id: 2,
          name: 'T',
          color: 7,
          blocks: [
              [
                  [0, 0, 0, 0],
                  [0, 1, 0, 0],
                  [2, 3, 4, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 2, 0, 0],
                  [0, 3, 1, 0],
                  [0, 4, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [4, 3, 2, 0],
                  [0, 1, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 4, 0, 0],
                  [1, 3, 0, 0],
                  [0, 2, 0, 0]
              ]
          ],
          cc: [0, 1, 0, 0],
          yp: [1, 2],
          spawn: [3, -2],
          kicks: _0xa670x52,
          h: [2, 3, 3, 3]
      }, {
          id: 3,
          name: 'L',
          color: 2,
          blocks: [
              [
                  [0, 0, 0, 0],
                  [0, 0, 1, 0],
                  [2, 3, 4, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 2, 0, 0],
                  [0, 3, 0, 0],
                  [0, 4, 1, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [4, 3, 2, 0],
                  [1, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [1, 4, 0, 0],
                  [0, 3, 0, 0],
                  [0, 2, 0, 0]
              ]
          ],
          cc: [0, 1, 0, 0],
          yp: [1, 2],
          spawn: [3, -2],
          kicks: _0xa670x52,
          h: [2, 3, 2, 3]
      }, {
          id: 4,
          name: 'J',
          color: 6,
          blocks: [
              [
                  [0, 0, 0, 0],
                  [1, 0, 0, 0],
                  [2, 3, 4, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 2, 1, 0],
                  [0, 3, 0, 0],
                  [0, 4, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [4, 3, 2, 0],
                  [0, 0, 1, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 4, 0, 0],
                  [0, 3, 0, 0],
                  [1, 2, 0, 0]
              ]
          ],
          cc: [0, 1, 0, 0],
          yp: [1, 2],
          spawn: [3, -2],
          kicks: _0xa670x52,
          h: [2, 3, 2, 3]
      }, {
          id: 5,
          name: 'S',
          color: 4,
          blocks: [
              [
                  [0, 0, 0, 0],
                  [0, 1, 2, 0],
                  [3, 4, 0, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 3, 0, 0],
                  [0, 4, 1, 0],
                  [0, 0, 2, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [0, 4, 3, 0],
                  [2, 1, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [2, 0, 0, 0],
                  [1, 4, 0, 0],
                  [0, 3, 0, 0]
              ]
          ],
          cc: [0, 1, 0, 0],
          yp: [1, 2],
          spawn: [3, -2],
          kicks: _0xa670x52,
          h: [2, 3, 2, 3]
      }, {
          id: 6,
          name: 'Z',
          color: 1,
          blocks: [
              [
                  [0, 0, 0, 0],
                  [1, 2, 0, 0],
                  [0, 3, 4, 0],
                  [0, 0, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 0, 1, 0],
                  [0, 3, 2, 0],
                  [0, 4, 0, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [4, 3, 0, 0],
                  [0, 2, 1, 0]
              ],
              [
                  [0, 0, 0, 0],
                  [0, 4, 0, 0],
                  [2, 3, 0, 0],
                  [1, 0, 0, 0]
              ]
          ],
          cc: [0, 1, 0, 0],
          yp: [1, 2],
          spawn: [3, -2],
          kicks: _0xa670x52,
          h: [2, 3, 2, 3]
      }];
      _0xa670x51['allspin'] = [
          [
              [
                  [-1, 1, 4, 1],
                  [
                      [1, 0, 2, 0],
                      [1, 2, 2, 2]
                  ]
              ],
              [
                  [2, -1, 2, 4],
                  [
                      [1, 1, 1, 2],
                      [3, 1, 3, 2]
                  ]
              ],
              [
                  [-1, 2, 4, 2],
                  [
                      [1, 1, 2, 1],
                      [1, 3, 2, 3]
                  ]
              ],
              [
                  [1, -1, 1, 4],
                  [
                      [0, 1, 0, 2],
                      [2, 1, 2, 2]
                  ]
              ]
          ], null, null, [
              [
                  [0, 3, 2, 3],
                  [0, 1, 1, 1]
              ],
              [
                  [0, 1, 0, 3],
                  [2, 1, 2, 2]
              ],
              [
                  [0, 1, 2, 1],
                  [1, 3, 2, 3]
              ],
              [
                  [2, 1, 2, 3],
                  [0, 2, 0, 3]
              ]
          ],
          [
              [
                  [0, 3, 2, 3],
                  [1, 1, 2, 1]
              ],
              [
                  [0, 1, 0, 3],
                  [2, 2, 2, 3]
              ],
              [
                  [0, 1, 2, 1],
                  [0, 3, 1, 3]
              ],
              [
                  [2, 1, 2, 3],
                  [0, 1, 0, 2]
              ]
          ],
          [
              [
                  [3, 1, -1, 2],
                  [0, 1, 2, 2]
              ],
              [
                  [1, 0, 2, 4],
                  [2, 1, 1, 3]
              ],
              [
                  [3, 2, -1, 3],
                  [0, 2, 2, 3]
              ],
              [
                  [0, 0, 1, 4],
                  [1, 1, 0, 3]
              ]
          ],
          [
              [
                  [-1, 1, 3, 2],
                  [0, 2, 2, 1]
              ],
              [
                  [2, 0, 1, 4],
                  [1, 1, 2, 3]
              ],
              [
                  [-1, 2, 3, 3],
                  [2, 2, 0, 3]
              ],
              [
                  [-1, 2, 0, 4],
                  [0, 1, 1, 3]
              ]
          ]
      ];
      _blockSets = [_0xa670x51];
      return _blockSets
  }
Game.prototype.ai_legalMoves = function(matrix, piece){
    let explored = new Map()
    const baseState = {x:piece.pos.x, y:piece.pos.y, r:piece.rot, actions:[], piece:{...piece},tcheck:false}
    for(let i = 0; i < 4; i++){
      let state = baseState
      if(i == 1)state = this.ai_simulateAction(state,'cw',matrix,piece,true)
      else if (i==2)state = this.ai_simulateAction(state,'180',matrix,piece,true)
      else if (i==3)state = state = this.ai_simulateAction(state,'ccw',matrix,piece,true)
      let copystate = {x:state.x, y:state.y, r:state.r, actions:[...state.actions], piece:state.piece,tcheck:state.tcheck}
      let input10 = this.ai_simulateAction(state,'sd',matrix,piece,true)
      explored.set(""+ input10.x+ " " + input10.y + " "+input10.r,input10)
      for(let offset = 0; offset < 10; offset++){
        let cx = state.x
        state = this.ai_simulateAction(state,'>',matrix,piece,true)
        if(cx == state.x)break
        let input1 = this.ai_simulateAction(state,'sd',matrix,piece,true)
        explored.set(""+ input1.x+ " " + input1.y + " "+input1.r,input1)
      }
        state = copystate
      for(let offset = 0; offset < 10; offset++){
        let cx = state.x
        state = this.ai_simulateAction(state,'<',matrix,piece,true)
        if(cx == state.x)break
        let input1 = this.ai_simulateAction(state,'sd',matrix,piece,true)
        explored.set(""+ input1.x+ " " + input1.y + " "+input1.r,input1)
      }
    }
    let newSet = [...explored.values()]
    for(let t = 0; t < 5; t++){
      if(newSet.length==0)break
      let addSet = []
      for(let state of newSet){
        let tryStates = []
        tryStates.push(this.ai_simulateAction(state,'<',matrix,piece,true))
        tryStates.push(this.ai_simulateAction(state,'>',matrix,piece,true))
        tryStates.push(this.ai_simulateAction(state,'sd',matrix,piece,true))
        tryStates.push(this.ai_simulateAction(state,'180',matrix,piece,true))
        tryStates.push(this.ai_simulateAction(state,'cw',matrix,piece,true))
        tryStates.push(this.ai_simulateAction(state,'ccw',matrix,piece,true))
        for(let tryState of tryStates){
          if(!this.ai_checkIntersection(tryState.x, tryState.y+1, tryState.r, matrix, piece)){
            tryState = this.ai_simulateAction(tryState, 'sd', matrix, piece,true)
          }
          if(!explored.has(""+ tryState.x+ " " + tryState.y + " "+tryState.r)){
            explored.set(""+ tryState.x+ " " + tryState.y + " "+tryState.r,tryState)
            addSet.push(tryState)
          }
          else if((explored.get(""+ tryState.x+ " " + tryState.y + " "+tryState.r).tcheck==false && tryState.tcheck) || (explored.get(""+ tryState.x+ " " + tryState.y + " "+tryState.r).actions.lenth>tryState.actions.length)){
            explored.set(""+ tryState.x+ " " + tryState.y + " "+tryState.r,tryState)
            addSet.push(tryState)
          }
        }
      }
      newSet = addSet
    }
    return(Array.from(explored.values()))
  }
Game.prototype.ai_simRotate = function(state_input, r, matrix, activeBlock) {
      var state = {x:state_input.x, y:state_input.y, r:state_input.r, actions:[...state_input.actions], piece:state_input.piece,tcheck:state_input.tcheck}
      let rString = (r === -1) ? '-1' : ((r === 1) ? '1' : '2'),
          newRot = (state.r + r + 4)%4;
      let block = this.blockSets[activeBlock.set].blocks[activeBlock.id],
          kicks = block.kicks[state.r][rString],
          kickLength = kicks.length;
      for (let i = 0; i < kickLength; i++) {
          let xOffset = kicks[i][0],
              yOffset = kicks[i][1];
          if (!this.ai_checkIntersection(state.x + xOffset, state.y - yOffset, newRot, matrix, activeBlock)) {
              state.x += xOffset;
              state.y -= yOffset;
              state.r = newRot;
              state.tcheck = true
              return state;
          }
      };
      return state
  };
Game.prototype.ai_simulateAction = function(state_input, action, matrix, piece,cbool) {
      var state = {x:state_input.x, y:state_input.y, r:state_input.r, actions:[...state_input.actions], piece:state_input.piece,tcheck:state_input.tcheck}
      if(cbool){
        if(state.actions[state.actions.length-1]=='hd')state.actions.pop()
        state.actions.push(action)
        state.actions.push('hd')
      }
      if (action == '<<') {
          for (let shift = 1; shift < 15; shift++) {
              if (this.ai_checkIntersection(state.x-shift, state.y, state.r, matrix, piece)) {
                  state.x -= shift - 1;
                  if(shift !=1)state.tcheck=false
                  return state;
              }
          }
      }
      else if (action == '>>') {
          for (let shift = 1; shift < 15; shift++) {
              if (this.ai_checkIntersection(state.x+shift, state.y, state.r, matrix, piece)) {
                  state.x += shift - 1;
                  if(shift !=1)state.tcheck=false
                  return state;
              }
          }
      }
      else if (action == '<') {
          if (!this.ai_checkIntersection(state.x-1, state.y, state.r, matrix, piece)) {
              state.x--;
              state.tcheck=false
              return state;
          }
          else {return state;}
      }
      else if (action == '>') {
          if (!this.ai_checkIntersection(state.x+1, state.y, state.r, matrix, piece)) {
              state.x++;
              state.tcheck=false
              return state;
          }
          else {return state;}
      }
      else if (action == 'cw') {
          return this.ai_simRotate(state, 1, matrix, piece);
      }
      else if (action == 'ccw') {
          return this.ai_simRotate(state, -1, matrix, piece);
      }
      else if (action == '180') {
          return this.ai_simRotate(state, 2, matrix, piece);
      }
      else if (action == 'sd') {
          for (let sd = 1; sd < 40; sd++) {
              if (this.ai_checkIntersection(state.x, state.y+sd, state.r, matrix, piece)) {
                  state.y = state.y + sd - 1;
                  if(sd!=1)state.tcheck=false
                  return state;
              }
          }
      }
  };
Game.prototype.ai_addGarbage= function(state,_0x44dcx77) {
  if(_0x44dcx77<=0)return
  let _0x44dcx78 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
  if (_0x44dcx77 <= state.matrix.length) {
    state.deadline = state.matrix[_0x44dcx77 - 1].slice(0)
  } else {
    state.deadline = _0x44dcx78.slice(0)
  };
  let _0x44dcx79 = state.matrix.length
  for (let _0x44dcx18 = 0; _0x44dcx18 < _0x44dcx79; _0x44dcx18++) {
    if ((_0x44dcx79 - _0x44dcx18) > _0x44dcx77) {
      state.matrix[_0x44dcx18] = state.matrix[_0x44dcx18 + _0x44dcx77].slice(0)
    } else {
      state.matrix[_0x44dcx18] = _0x44dcx78.slice(0)
    }
  };
};
Game.prototype.ai_checkIntersection = function(_v6b, _v6c, _vf0, matrix, piece) {
_vf0 = (_vf0 === null) ? piece.rot : _vf0;
let _v34 = this.blockSets[piece.set],
    _v35 = _v34.blocks[piece.id].blocks,
    _v36 = _v34.blocks[piece.id].blocks[_vf0].length;
for (var _v18 = 0; _v18 < _v36; _v18++) {
    for (var _v19 = 0; _v19 < _v36; _v19++) {
        if (_v35[_vf0][_v18][_v19] > 0) {
            if ((_v6c + _v18) >= 20) {
                return true
            };
            if ((_v6b + _v19) < 0 || (_v6b + _v19) >= 10) {
                return true
            };
            if ((_v6c + _v18) >= 0 && matrix[_v6c + _v18][_v6b + _v19] > 0) {
                return true
            }
        }
    }
};
return false
};
Game.prototype.ai_nextState = function(push,move) {
  let state = copyState(push)
  state.matrix = this.ai_placeBlock(move.x,move.y,move.r,state.matrix,move.piece)
  let cleared_lines = 0
  let blocks_line = 0
  let sum_blocks = 0
  let spinMiniPossible = false
  let spinPossible = false
  let clear_score_type = ''
  if(move.piece.id==2){
    let res = this.ai_checkTSpin(state,move)
    spinMiniPossible=res.spinMiniPossible
    spinPossible=res.spinPossible
  }
  for(let w = 0; w < 10; w++){
    if(state.deadline[w]!=0)blocks_line++
    else{
      if(blocks_line>0)break
    }
  }
  if(blocks_line==10){
    state.deadline=[0,0,0,0,0,0,0,0,0,0]
    blocks_line++
  }
  else sum_blocks+=blocks_line
  for(let h = 0; h<20; h++){
    blocks_line=0
    for(let w = 0; w < 10; w++){
      let id = state.matrix[h][w]
      if(id==9)break
      else{
        if(id!=0){
          blocks_line++
        }
        else{
          if(sum_blocks+blocks_line>0)break
        }
      }
    }
    if(blocks_line==10){
      for(let i = h; i>0; i--)state.matrix[i]=state.matrix[i-1]
      state.matrix[0]=state.deadline.slice()
      state.deadline = [0,0,0,0,0,0,0,0,0,0]
      blocks_line=0
      cleared_lines++
    }
    sum_blocks+=blocks_line
  }
  let attack = 0
  if(cleared_lines>0){
    switch (cleared_lines) {
      case 1:
        attack = this.linesAttack[1]
        if(spinPossible){
          clear_score_type='TSS'
          attack = this.linesAttack[7]
          if(state.isBack2Back){
            state.stats.B2B++
            attack += this.linesAttack[10]
          }
          else state.isBack2Back = true
          state.stats.TSS++
        }
        else{
          if(spinMiniPossible){
            clear_score_type='TSMS'
            if(state.isBack2Back)state.stats.B2B++
            else state.isBack2Back=true
            attack = this.linesAttack[8]
            state.stats.TSMS++
          }
          else{
            state.isBack2Back = false
            clear_score_type='CLEAR1'
            state.stats.CLEAR1++
          }
        }
        break;
      case 2:
        attack = this.linesAttack[2]
        if(spinPossible||spinMiniPossible){
          state.stats.TSD++
          attack = this.linesAttack[5]
          clear_score_type='TSD'
          if(state.isBack2Back){
            state.stats.B2B++
            attack+=this.linesAttack[10]
          }
          else state.isBack2Back=true
        }
        else{
          state.isBack2Back=false
          clear_score_type='CLEAR2'
          state.stats.CLEAR2++
        }
        break;
      case 3:
        attack = this.linesAttack[3]
        if(spinPossible||spinMiniPossible){
          attack = this.linesAttack[6]
          clear_score_type='TST'
          if(state.isBack2Back){
            state.stats.B2B++
            attack+=this.linesAttack[10]
          }
          else state.isBack2Back = true
          state.stats.TST++
        }
        else{
          state.isBack2Back=false
          clear_score_type= 'CLEAR3'
          state.stats.CLEAR3++
        }
        break;
      case 4:
      default:
        state.stats.CLEAR4++
        clear_score_type='CLEAR4'
        attack = this.linesAttack[4]
        if(state.isBack2Back){
          state.stats.B2B++
          attack += this.linesAttack[10]
        }
        else{
          state.isBack2Back=true
        }
        break;
    }
    if(sum_blocks==0 && state.stats.CLEAN_RECIEVED+state.stats.MESSY_RECIEVED<=0){
      state.stats.PC++
      attack = this.linesAttack[9]
      clear_score_type='PC'
    }
    state.comboCounter++
    let comboAttack = (state.comboCounter <= 12) ? this.comboAttack[state.comboCounter] : this.comboAttack[this.comboAttack.length - 1]
    state.stats.COMBO+=comboAttack
    attack += comboAttack
    if(attack>0){
      for(let i = 0; i < state.incomingGarbage.length; i++){
        if(state.incomingGarbage[i]==0){
          break
        }
        attack -= state.incomingGarbage[i]
        if(attack>0)state.incomingGarbage[i]= 0
        else{
          state.incomingGarbage[i]=-attack
          attack = 0
          break
        }
      }
      while(state.incomingGarbage[0]==0)state.incomingGarbage.shift()
    }
    else{
      if(state.incomingGarbage.length > 0){
        if(state.incomingGarbage[0]==0)state.incomingGarbage.shift()
        else if(state.incomingGarbage[1]>0){
          state.incomingGarbage[1]=state.incomingGarbage[0]
          state.incomingGarbage.shift()
        }
      }
    }
  }
  else{
    state.comboCounter=-1
    while(state.incomingGarbage.length>0){
      if(state.incomingGarbage[0]==0){
        state.incomingGarbage.shift()
        break
      }
      this.ai_addGarbage(state,state.incomingGarbage[0])
      if(state.incomingGarbage<4){state.stats.MESSY_RECIEVED+=state.incomingGarbage[0]}
      else state.stats.CLEAN_RECIEVED+=state.incomingGarbage[0]
      state.incomingGarbage.shift()
    }
  }
  if(clear_score_type=='TSMS' || (cleared_lines<=0 && move.piece.id==2))state.stats.WASTE++
  state.stats.ATTACK+=attack
  if(state.currSpike>=0){
    if(attack > 0){
      state.currSpike += attack
      state.stats.SPIKE = Math.max(state.currSpike,state.stats.SPIKE)
    }
    else state.currSpike *= -1
  }
  else if (state.currSpike <0 ){
    if(attack >0)state.currSpike = state.currSpike*-0.7 + attack
    else state.currSpike = 0
  }
  state.action = clear_score_type
  if(move.piece.id == state.queue[0].id){
    state.queue.shift()
  }
  else if (move.piece.id == state.hold.id){
    state.hold = state.queue.shift()
  }
  else if(move.piece.id == state.queue[1].id){
    state.hold = state.queue.shift()
    state.queue.shift()
  }
  let active = state.queue[0]
  if(active){
  let bset = this.blockSets[active.set].blocks[active.id]
  active.pos.x =bset.spawn[0]
  active.pos.y = bset.spawn[1]
  if (active.set === 0) {
      let offset = bset.blocks[0][-active.pos.y];
      if ((state.matrix[0][3] && offset[0]) || (state.matrix[0][4] && offset[1]) || (state.matrix[0][5] && offset[2]) || (state.matrix[0][6] && offset[3])) {
          active.pos.y--
      }
  } else {
      while (this.ai_checkIntersection(active.pos.x, active.pos.y, active.rot, state.matrix, state.deadline)) {
          active.pos.y--
      }
  };
  let rlen = bset.blocks[0].length
  var ky = -(1 + active.pos.y);
  if (ky >= 0 && ky < rlen) {
      for (var i = 0; i < rlen; ++i) {
          if (bset.blocks[active.rot][ky][i] && state.deadline[active.pos.x + i]) {
            state.dead = true
              break
          }
      }
  }}
  return state
}
Game.prototype.ai_placeBlock = function(_v6b, _v6c, _vf0, matrix, piece) {
    let newMatrix = matrix.map(arr => arr.slice());
_vf0 = (_vf0 === null) ? piece.rot : _vf0;
let _v34 = this.blockSets[piece.set],
    _v35 = _v34.blocks[piece.id].blocks,
    _v36 = _v34.blocks[piece.id].blocks[_vf0].length;
for (let _v18 = 0; _v18 < _v36; _v18++) {
    for (let _v19 = 0; _v19 < _v36; _v19++) {
        if (_v35[_vf0][_v18][_v19] > 0) {
            if ((_v6c + _v18) >= 20) {
                continue;
            };
            if ((_v6b + _v19) < 0 || (_v6b + _v19) >= 10) {
                continue;
            };
            if ((_v6c + _v18) >= 0) {
                newMatrix[_v6c + _v18][_v6b + _v19]=piece.id+1
            }
        }
    }
};
return newMatrix
};
Game.prototype.ai_fireAction = function(action, time=undefined) {
        time = time || this.timestamp();
        if (action == '<<') {
            this.activateDAS(-1, time);
            this.ARRon[-1] = false;
        }
        else if (action == '>>') {
            this.activateDAS(1, time);
            this.ARRon[1] = false;
        }
        else if (action == '<') {
            let timestamp = time;
            this.moveCurrentBlock(-1, false, timestamp);
            this.pressedDir['-1'] = timestamp;
            this.Replay.add(new ReplayAction(this.Replay.Action.MOVE_LEFT, this.pressedDir['-1']));
        }
        else if (action == '>') {
            let timestamp = time;
            this.moveCurrentBlock(1, false, timestamp);
            this.pressedDir['1'] = timestamp;
            this.Replay.add(new ReplayAction(this.Replay.Action.MOVE_RIGHT, this.pressedDir['1']));
        }
        else if (action == 'hold') {
            this.holdBlock();
        }
        else if (action == 'cw') {
            this.rotateCurrentBlock(1);
            this.Replay.add(new ReplayAction(this.Replay.Action.ROTATE_RIGHT, time));
        }
        else if (action == 'ccw') {
            this.rotateCurrentBlock(-1);
            this.Replay.add(new ReplayAction(this.Replay.Action.ROTATE_LEFT, time));
        }
        else if (action == '180') {
            this.rotateCurrentBlock(2);
            this.Replay.add(new ReplayAction(this.Replay.Action.ROTATE_180, time));
        }
        else if (action == 'hd') {
            this.hardDrop(time);
        }
        else if (action == 'sd') {
            this.softDropSet(true, time);
            this.update(0, time);
            this.softDropSet(false, time);
        }
    }
Game.prototype.ai_checkTSpin = function(state,move) {
    if(!move.tcheck==true)return {spinPossible:false,spinMiniPossible: false}
    let check1 = 0,
        check2 = 0,
        r = move.r,
        x = move.x,
        y = move.y;
    if (y < -2) {
        return false
    };
    switch (r) {
        case 0:
            if (y >= -1) {
                check1 = (state.matrix[y + 1][x] > 0) + (state.matrix[y + 1][x + 2] > 0)
            } else {
                if (y === -2) {
                    check1 = (state.deadline[x] > 0) + (state.deadline[x + 2] > 0)
                }
            };
            if (y === 17) {
                check2 = 2
            } else {
                check2 = (state.matrix[y + 3][x] > 0) + (state.matrix[y + 3][x + 2] > 0)
            };
            break;
        case 1:
            if (x === -1) {
                check2 = 2
            };
            if (y >= -1) {
                check1 = (state.matrix[y + 1][x + 2] > 0) + (state.matrix[y + 3][x + 2] > 0);
                if (!check2) {
                    check2 = (state.matrix[y + 1][x] > 0) + (state.matrix[y + 3][x] > 0)
                }
            } else {
                if (y === -2) {
                    check1 = (state.deadline[x + 2] > 0) + (state.matrix[y + 3][x + 2] > 0);
                    if (!check2) {
                        check2 = (state.deadline[x] > 0) + (state.matrix[y + 3][x] > 0)
                    }
                }
            };
            break;
        case 2:
            if (y >= -1) {
                check2 = (state.matrix[y + 1][x] > 0) + (state.matrix[y + 1][x + 2] > 0)
            } else {
                if (y === -2) {
                    check2 = (state.deadline[x] > 0) + (state.deadline[x + 2] > 0)
                }
            };
            if (y === 17) {
                check1 = 2
            } else {
                check1 = (state.matrix[y + 3][x] > 0) + (state.matrix[y + 3][x + 2] > 0)
            };
            break;
        case 3:
            if (x === 8) {
                check2 = 2
            };
            if (y >= -1) {
                check1 = (state.matrix[y + 1][x] > 0) + (state.matrix[y + 3][x] > 0);
                if (!check2) {
                    check2 = (state.matrix[y + 1][x + 2] > 0) + (state.matrix[y + 3][x + 2] > 0)
                }
            } else {
                if (y === -2) {
                    check1 = (state.deadline[x] > 0) + (state.matrix[y + 3][x] > 0);
                    if (!check2) {
                        check2 = (state.deadline[x + 2] > 0) + (state.matrix[y + 3][x + 2] > 0)
                    }
                }
            };
            break
    };
    return {spinPossible:(check1 === 2 && check2 >= 1),spinMiniPossible: (check1 === 1 && check2 === 2)}
};
Game.prototype.matchTspin = function(state){
  let lastmove = {tslot:-1}
  let bestState = null
  for(let slot of this.TSLOTS){
    for(let x = 0; x<7; x++){
      let move = slot(state.matrix,x)
      if(move==false)continue
      let newState = this.ai_nextState(state,move)
      if(newState.action=='TSS')move.tslot= 1
      else if(newState.action=='TSD')move.tslot= 2
      else if(newState.action=='TST')move.tslot= 3
      else move.tslot=0
      if(move.tslot>lastmove.tslot){
        lastmove=move
        bestState = newState
        bestState.tslot=move.tslot
      }
    }
  }
  return bestState
}
Game.prototype.getValue = function(state,move, standard){
    let score = 0
    let matrix = state.matrix
    let ts = 0;
    let s_len = Math.min(7,state.queue.length)
    for(let i =0; i < s_len; i++){
      if(this.blockSets[state.queue[i].set].blocks[state.queue[i].id].name=='T'){
        ts++
      }
    }
    ts = Math.min(ts,3)
    let newState = copyState(state)
    for(let t = 0; t < ts; t++){
      newState = this.matchTspin(newState)
      if(newState==null)break
      matrix = newState.matrix
      score+=standard.tslot[newState.tslot]
    }
  let heights = []
  for(let i = 0; i < matrix[0].length; i++){
    heights.push(columnHeight(matrix,i))
  }
      let maxHeight = Math.max(...heights)
  score+=standard.top_quarter * Math.max(maxHeight-15,0)
  score+=standard.top_half * Math.max(maxHeight-10,0)
  score += standard.height * maxHeight
  let row_trans=0
  for(let row of matrix){
      let last = true
      for(let i = 0; i <= row.length; i++){
          if(row[i]!=0 != last){
              row_trans++
              last = row[i]!=0
          }
      }
  }
    score += standard.row_transitions*row_trans


  let covered = 0
  for(let x = 0; x<10; x++){
      for(let y = heights[x]-2; y>=0; y--){
          if(matrix[19-y][x]==0){
              let cells = Math.min(6, heights[x]-y-1)
              covered+=cells
          }
      }
  }

    score +=standard.covered_cells * covered + covered*covered*standard.covered_cells_sq


      let cavities = 0, overhangs = 0
      for(let y = 19; y>19-maxHeight; y--){
          for(let x = 0; x<10; x++){
              let y1 = 19-y
              if(matrix[y][x]!=0 || y1>=heights[x])continue
              if(x>1){
                  if(heights[x-1]<=y1-1&&heights[x-2]<=y1){
                      overhangs+=1
                      continue
                  }
              }
              if(x<8){
                  if(heights[x+1]<=y1-1&&heights[x+2]<=y1){
                      overhangs+=1
                      continue
                  }
              }
              cavities+=1
          }
      }

    score += standard.overhang_cells * overhangs + standard.overhang_cells_sq *overhangs * overhangs
    score += standard.cavity_cells * cavities + standard.cavity_cells_sq * cavities * cavities



  let well = 0
  for(let i = 1; i<matrix[0].length; i++){
      if(heights[i]<=heights[well])well=i
  }
  score+=state.stats.CLEAN_RECIEVED*standard.tank[0]+state.stats.MESSY_RECIEVED*standard.tank[1]
  let depth = 0
  for(let y = 19-heights[well]; y>=0; y--){
      let check = false
      for(let x = 0; x<10; x++){
          if(x!=well && matrix[y][x]==0){
              check = true
          }
      }
      if(check)break
      else depth++
  }
  score += standard.well_depth * Math.min(depth,standard.max_well_depth)
    if(depth>0){
      score += standard.well_column[well]
    }
    if(state.isBack2Back)score += standard.back_to_back

    let bumpiness = -1
    let bumpiness_sq = -1
    let prev = 1
    if(well!=0)prev = 0
    for(let i = 0; i < 10; i++){
        if(i==well)continue
        let dh = Math.abs(heights[prev]-heights[i])
        bumpiness+=dh
        bumpiness_sq+=dh*dh
        prev = i
    }
    score += standard.bumpiness * bumpiness + standard.bumpiness_sq * bumpiness*bumpiness
    score+=standard.clear1*state.stats.CLEAR1
    score+=standard.clear2*state.stats.CLEAR2
    score+=standard.clear3*state.stats.CLEAR3
    score+=standard.clear4*state.stats.CLEAR4
    score+=standard.mini_tspin1*state.stats.TSMS
    score+=standard.tspin1*state.stats.TSS
    score+=standard.tspin2*state.stats.TSD
    score+=standard.tspin3*state.stats.TST
    score+=standard.perfect_clear*state.stats.PC
    score+=standard.wasted_t*state.stats.WASTE
    score+=standard.b2b_clear*state.stats.B2B
    score+=standard.combo_garbage*state.stats.COMBO
    if(state.stats.SPIKE>7)score+=standard.spike*state.stats.SPIKE
  return score
}
let game = new Game()
class Node{
  constructor(parent=null, state=null, move=null, value = 0){
    this.parent = parent
    this.children = []
    this.orphans = []
    this.move = move
    this.state = state
    this.value = value
    this.dead = false
  }
}
class Bot{
  constructor(){
    this.settings = {
        weights:{
            back_to_back: 52,
            bumpiness: -24,
            bumpiness_sq:-7,
            row_transitions:-5,
            height:-39,
            top_half:-150,
            top_quarter:-511,
            cavity_cells:-173,
            cavity_cells_sq:-3,
            overhang_cells:-34,
            overhang_cells_sq: -1,
            covered_cells: -17,
            covered_cells_sq: -1,
            tslot: [8, 148, 192, 407],
            well_depth: 57,
            max_well_depth: 17,
            well_column: [-30, -50, 20, 50, 60, 60, 50, 20, -50, -30],

            wasted_t: -152,
            b2b_clear: 104,
            clear1: -143,
            clear2: -100,
            clear3: -58,
            clear4: 390,
            tspin1: 121,
            tspin2: 410,
            tspin3: 602,
            mini_tspin1: -158,
            mini_tspin2: -93,
            perfect_clear: 999,
            combo_garbage: 200,
            tank:[17,4],
            spike:115,
        },
        useHold:true,
        botIters:10000,
        cheesyCutoff:-1000,
    }
    this.state = null
    this.root = null
    this.iters = 0
    this.calculating=false
  }
  loadWeights(arr){
  this.settings.weights = {
                back_to_back: arr[0],
                bumpiness: arr[1],
                bumpiness_sq:arr[2],
                row_transitions:arr[3],
                height:arr[4],
                top_half:arr[5],
                top_quarter:arr[6],
                cavity_cells:arr[7],
                cavity_cells_sq:arr[8],
                overhang_cells:arr[9],
                overhang_cells_sq:arr[10],
                covered_cells:arr[11],
                covered_cells_sq:arr[12],
                tslot: [arr[13], arr[14], arr[15], arr[16]],
                well_depth: arr[17],
                max_well_depth: arr[18],
                well_column: [arr[19], arr[20], arr[21], arr[22], arr[23], arr[24], arr[25], arr[26], arr[27], arr[28]],

                wasted_t: arr[29],
                b2b_clear: arr[30],
                clear1: arr[31],
                clear2: arr[32],
                clear3: arr[33],
                clear4: arr[34],
                tspin1: arr[35],
                tspin2: arr[36],
                tspin3: arr[37],
                mini_tspin1: arr[38],
                mini_tspin2: arr[39],
                perfect_clear: arr[40],
                combo_garbage: arr[41],
                tank:[arr[42],arr[43]],
                spike:arr[44],
            }
  }
  loadState(state,flipped = false){
    if(flipped)this.state=copyState(state)
    else this.state = TFstate(state)
    this.root = new Node(null, copyState(this.state))
    this.expandNode(this.root)
    this.backprop(this.root)
  }
  async think(){
    if(this.state == null || !this.calculating)return
    this.iters = 0
    while(this.iters<this.settings.botIters){
      if(this.iters %50==0)await new Promise(resolve => setTimeout(resolve,0));
      if(!this.calculating){
        return
      }
      this.iters++
      let selectedNode = this.selectNode(this.root)
      this.expandNode(selectedNode)
      this.backprop(selectedNode)
    }
  }
  getMoves(flipped = false){
    this.root.children = this.root.children.concat(this.root.orphans)
    if(flipped)return this.root.children.map(x=>x.move)
    return this.root.children.map(x=>FTmove(x.move))
  }
  processMove(move){
    move = TFmove(move)
    let state = game.ai_nextState(this.state,move)
    this.loadState(state,true)
  }
  addPieceToQueue(piece){
    this.state.queue.push(new Block(reversePIndex[piece]))
  }
  expandNode(node){
    let state = node.state
    if(state.queue.length==0){
      return
    }
    let moves = game.ai_legalMoves(state.matrix, state.queue[0])
    if(this.settings.useHold){
      if(state.hold.id==undefined){
        if(state.queue.length>=2)moves = moves.concat(game.ai_legalMoves(state.matrix, state.queue[1]))
      }
      else{
        moves = moves.concat(game.ai_legalMoves(state.matrix, state.hold))
      }
    }
    for(let move of moves){
      let newState = game.ai_nextState(state,move)
      let child = new Node(node,newState,move,game.getValue(newState,move,this.settings.weights))
      node.children.push(child)
    }
  }
  selectNode(root){
    while(root.children.length>0){
      let n = root.children.length
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
      root = root.children[index]
    }
    return root
  }
  backprop(node){
    while(node!=null){
      if(node.children.length>0){
        if(node.parent == null)node.children.sort((a,b)=> (a.value < b.value)?1:-1)
        else node.children.sort((a,b)=> (a.value< b.value)?1:-1)
        node.value = node.children[0].value
      }
      node = node.parent
    }

  }
  frontprop(root, depth){
      let node = root
      let goal = root.goal
      let path = []
      while(node!=null && depth>0){
          depth--
          if(node.children.length==0)break
          else node = node.children[0]
          path.push(node.move)
      }
      return path
  }
}
let bot = new Bot()

//function postMessage(e){console.log(e)}

onmessage = function(e) {
	let m = e.data;
	switch (m.type) {
		case "rules":
			// Currently, this message is empty, and will be extended later.
			// The bot must respond with either the ready message, if the bot can play with those rules, or error if it cannot.
			postMessage({
				type: "ready"
			});
			break;
		case "start":
			bot.calculating=false
			// The start message tells the bot to begin calculating from the specified position.
      let state = {hold:m.hold, queue:m.queue,combo:m.combo,back_to_back:m.back_to_back,board:m.board}
      bot.loadState(state)
      bot.calculating=true
			bot.think()
			break;
		case "suggest":
			bot.calculating=false
			// The suggest message tells the bot to suggest some next moves in order of preference.
			postMessage({
				type: "suggestion",
				moves: bot.getMoves(),
        move_info: {rollouts:bot.iters+1}
			});
			break;
		case "play":
			// Tells the bot to advance its game state as if the specified move was played and begin calculating from that position
      bot.calculating=false
			bot.processMove(m.move);
      bot.calculating=true
      bot.think()
			break;
		case "new_piece":
			// The new_piece message informs the bot that a new piece has been added to the queue.
			bot.addPieceToQueue(m.piece);
			break;
		case "stop":
			// The stop message tells the bot to stop calculating.
			bot.calculating=false
			break;
		case "quit":
			// The quit message tells the bot to exit.
			bot.calculating=false
			break;
	}
}

function start() {
	postMessage({
		type: "info",
		name: "freybot",
		author: "freyhoe",
		version: "0.0",
		features: ["uses hold", "uses previews", "uses spins", "uses cat power"],
	});
};
start();
