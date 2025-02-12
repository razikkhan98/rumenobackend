//  Generate uniquel Code

function generateUniqueldId(animalName) {
  
    // uuid ( last 4 digits number )
    const uuid = Math.floor(100000 + Math.random() * 9000)
      .toString()
      .substr(-6);
  
    // generate parent code
    const parentCode = `${animalName || kiduniqueName.toUpperCase()}-${uuid}`;
  
    return parentCode;
  }
  
module.exports = generateUniqueldId;
  