const crypto = require('node:crypto');
const BUY_IN=200_000,TARGET=10_000_000,MAX_SEATS=20,BET_SECONDS=15,RESULT_SECONDS=7,LIGHTNING_VALUES=[2,3,4,5,8];
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],SUITS=['♠','♥','♦','♣'];
const PRELOADED_ROUNDS=20;
function initialHistory(){
  const history=[];
  for(let round=1;round<=PRELOADED_ROUNDS;round++){
    const d=deal();
    history.unshift({round,outcome:d.outcome,playerTotal:d.playerTotal,bankerTotal:d.bankerTotal,multiplier:1,playerPair:d.player[0].rank===d.player[1].rank,bankerPair:d.banker[0].rank===d.banker[1].rank,preloaded:true});
  }
  return history;
}
const newState=()=>({phase:'lobby',round:PRELOADED_ROUNDS,deadline:null,seats:Array(MAX_SEATS).fill(null),bets:{},lightning:[],cards:{player:[],banker:[]},result:null,winner:null,history:initialHistory(),adminOnline:false});
function card(){return{rank:RANKS[crypto.randomInt(RANKS.length)],suit:SUITS[crypto.randomInt(SUITS.length)]}}
function value(c){return c.rank==='A'?1:Number(c.rank)||0}function total(hand){return hand.reduce((n,c)=>n+value(c),0)%10}
function lightning(){const count=crypto.randomInt(2,8),selected=[];while(selected.length<count){const c=card();if(!selected.some(x=>x.rank===c.rank&&x.suit===c.suit))selected.push({...c,multiplier:LIGHTNING_VALUES[crypto.randomInt(LIGHTNING_VALUES.length)]})}return selected}
function deal(){const player=[card(),card()],banker=[card(),card()],pt=total(player),bt=total(banker);if(pt<8&&bt<8){if(pt<=5){const third=card();player.push(third);const v=value(third);if(bt<=2||(bt===3&&v!==8)||(bt===4&&v>=2&&v<=7)||(bt===5&&v>=4&&v<=7)||(bt===6&&(v===6||v===7)))banker.push(card())}else if(bt<=5)banker.push(card())}const p=total(player),b=total(banker);return{player,banker,playerTotal:p,bankerTotal:b,outcome:p>b?'player':b>p?'banker':'tie'}}
function multiplierFor(hand,strikes){return hand.reduce((m,c)=>{const hit=strikes.find(x=>x.rank===c.rank&&x.suit===c.suit);return hit?m*hit.multiplier:m},1)}
function publicState(s){return{...s,seats:s.seats.map(x=>x&&({...x,token:undefined})),bets:{}}}
module.exports={BUY_IN,TARGET,MAX_SEATS,BET_SECONDS,RESULT_SECONDS,PRELOADED_ROUNDS,newState,deal,lightning,multiplierFor,publicState,total};
