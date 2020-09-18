import React,{ useState } from "react";

function incLetter(letter, freqList){
  return freqList.map((k) =>{ 
    if (k[0] === letter){
      return [k[0],k[1]+.003];
    }
    else { 
      return [k[0],k[1]-(.003/25)] ;
    }
  })
}

function decLetter(letter, freqList){
  return freqList.map((k) =>{ 
    if (k[0] === letter){
      return [k[0],k[1]-.003];
    }
    else { 
      return [k[0],k[1]+(.003/25)] ;
    }
  })
}

function generateAcro(length,letterFreq){
  let acro ='';
  for(let letter = 0; letter < length; letter++){
    let rand = Math.random();
    let sum = 0;
    for(let i=0; i < 26; i++){
      if(sum >= rand){
        acro += letterFreq[i-1][0];
        break;
      }
      else if (i === 25){
        acro += letterFreq[i][0];
        break;
      }
      else {
        sum += letterFreq[i][1];
      }
    }
  }
  return acro;
}

function generateNAcros(n,len,freqList){
  let output = [];
  for(let i = 0; i<n; i++)
  {
    output.push(generateAcro(len,freqList))
  }
  return output;
}

function letterButton( letter,freq,freqList,decCallback,incCallback ){
  let maxFreq = freqList.map((i) => i[1]).reduce((a,b) => {
    return Math.max(a,b);
  });
  return (
    <div>
      <button onClick={decCallback}>-</button> 
        <progress id='freqProg' value={freq} 
          max={maxFreq > (2/26) ? maxFreq : 2/26}></progress>
      <button onClick={incCallback}>+</button>
      [{letter},{freq}]
    </div>);
}

function copy(text){
  let input = document.createElement("input");
  input.style.opacity="0";
  input.style["pointer-events"] = "none";
  document.body.appendChild(input);
  input.value = text;
  input.focus();
  input.select();
  document.execCommand('copy');
}

function Acrotest({ currentFreqList, updateFunction }){
  const [freqList, setFreqList] = useState(currentFreqList);

  return (
  <div className='tests'>
    <div className='testButtons'>
      {freqList.map((i) => 
        {return letterButton(i[0], i[1], freqList,
          ()=>{
            setFreqList(decLetter(i[0],freqList));
            updateFunction(freqList);
          }, 
          ()=>{
            setFreqList(incLetter(i[0],freqList));
            updateFunction(freqList);
          })})}
    </div>
    <div className='exampleAcros'>
      { generateNAcros(40,5,freqList).map((i)=> <div>{i}</div>) }
    </div>
  </div>
  );
}

export default Acrotest;
