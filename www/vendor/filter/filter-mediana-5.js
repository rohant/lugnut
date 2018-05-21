
//Also worth looking at is the Median-5 method.
//Each x (or y) coordinate is set to the median of the 5 x (or y) values around it in sequence (i.e. itself, the two previous values and the two subsequent values).
//e.g. x3 = median(x1,x2,x3,x4,x5) y3 = median(y1,y2,y3,y4,y5) etc.
//Method is quick and is also easy to use on streaming data.



//var data = [       
//    { values: 4 }, 
//    { values: 4 }, 
//    { values: 4 }, 
//    { values: 5 }, 
//    { values: 2 }, 
//    { values: 6 }, 
//    { values: 6 },
//    { values: 5 }
//];
//
//// calculate the median
//function median(arr){
//  arr = arr.sort(function(a, b){ return a - b; });
//  var i = arr.length / 2;
//  return i % 1 == 0 ? (arr[i - 1] + arr[i]) / 2 : arr[Math.floor(i)];
//}
//
//var myArray = data.map(function(d){ return d.values; });
//var myMedian = median(myArray); // 4.5