//  Generate uniquel Code

function generateUniqueldId(uniqueName , kiduniqueName) {
  
    // uuid ( last 4 digits number )
    const uuid = Math.floor(100000 + Math.random() * 9000)
      .toString()
      .substr(-6);
  
    // generate parent code
    const parentCode = `${uniqueName|| kiduniqueName.toUpperCase()}-${uuid}`;
  
    return parentCode;
  }
  
module.exports = generateUniqueldId;
  