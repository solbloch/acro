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
    <div className='freq-card' key={letter}>
      <div className='freq-card__header'>
        <strong>{letter}</strong>
        <span>{freq.toFixed(3)}</span>
      </div>
      <progress className='freq-card__meter' value={freq} 
        max={maxFreq > (2/26) ? maxFreq : 2/26}></progress>
      <div className='freq-card__actions'>
        <button className='button button--ghost button--icon' onClick={decCallback}>-</button>
        <button className='button button--ghost button--icon' onClick={incCallback}>+</button>
      </div>
    </div>);
}

function Acrotest({ currentFreqList, updateFunction }){
  const [freqList, setFreqList] = useState(currentFreqList);

  const updateFreqList = (nextFreqList) => {
    setFreqList(nextFreqList);

    if (updateFunction) {
      updateFunction(nextFreqList);
    }
  };

  return (
  <section className='tests'>
    <div className='panel__header'>
      <p className='eyebrow'>Host options</p>
      <h2>Tune letter frequency</h2>
    </div>
    <div className='testButtons'>
      {freqList.map((i) => 
        {return letterButton(i[0], i[1], freqList,
          ()=>{
            updateFreqList(decLetter(i[0],freqList));
          }, 
          ()=>{
            updateFreqList(incLetter(i[0],freqList));
          })})}
    </div>
    <div className='exampleAcros'>
      <p className='eyebrow'>Preview</p>
      <div className='exampleAcros__grid'>
        { generateNAcros(40,5,freqList).map((i, index)=> <div className='exampleAcros__item' key={`${i}-${index}`}>{i}</div>) }
      </div>
    </div>
  </section>
  );
}

export default Acrotest;
