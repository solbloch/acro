const letterFreq = [['A', 0.11281],
                    ['B', 0.15715],
                    ['C', 0.20953],
                    ['D', 0.24127],
                    ['E', 0.26926],
                    ['F', 0.30953],
                    ['G', 0.32595],
                    ['H', 0.36795],
                    ['I', 0.44089],
                    ['J', 0.446],
                    ['K', 0.45456],
                    ['L', 0.47871],
                    ['M', 0.51697],
                    ['N', 0.53981],
                    ['O', 0.61612],
                    ['P', 0.65931],
                    ['Q', 0.66153],
                    ['R', 0.68979],
                    ['S', 0.75665],
                    ['T', 0.91643],
                    ['U', 0.92826],
                    ['V', 0.9365],
                    ['W', 0.99147],
                    ['X', 0.99192],
                    ['Y', 0.99955],
                    ['Z', 1]]

exports.generateAcro = (length) => {
  let acro ='';
  for(let letter = 0; letter < length; letter++){
    let rand = Math.random();

    // Binary sort over letterFreq.
    let left = 0;
    let right = 25;
    let middle = 0;

    while(left <= right){
      middle = Math.floor((left + right)/2);
      
      // Fix the -1 indexing with this.
      if(middle === 0){
        acro += letterFreq[middle][0];
        break
      }
      if(letterFreq[middle][1] >= rand && letterFreq[middle-1][1] <= rand){
        acro += letterFreq[middle][0];
        break;
      }
      else if(letterFreq[middle][1] < rand){
        left = middle + 1;
      }
      else if(letterFreq[middle][1] > rand){
        right = middle - 1;
      }
    }
  }
  return acro;
}
