let multipleArray = [
  ["5630024", 70, 80], //1人目
  ["6060024", 40, 20], //2人目
  ["4020046", 90, 60]  //3人目
]

multipleArray.sort( (a, b) => {
  return a[0] - b[0]
})

console.log(multipleArray);