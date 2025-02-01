//  Generate Parent Code

function generateParentCode(uniqueName) {
  // example : - parent code : - PCOW-28  ( P :- Parent , COW : - uuid , - , 28 : - uniqueNumber ) fromat

  // uuid ( last 4 digits number )
  const uuid = Math.floor(1000 + Math.random() * 9000)
    .toString()
    .substr(-5);

  // generate parent code
  const parentCode = `P${uniqueName.toUpperCase()}-${uuid}`;

  return parentCode;
}

module.exports = generateParentCode;
