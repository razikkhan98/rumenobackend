// //  Generate uniquel Code

// function generateUniqueldId(farmName) {
  
//     // uuid ( last 4 digits number )
//     const uuid = Math.floor(1000 + Math.random() * 9000)
//       .toString()
//       .substr(-6);
  
//     // generate parent code
//     const parentCode = `${farmName || kiduniqueName.toUpperCase()}-${uuid}`;
  
//     return parentCode;
//   }
  
// module.exports = generateUniqueldId;
  



// Generate Unique Id

const farmCounts = {}; // Tracks count per full farm name

function generateUniqueFarmId(farmName) {
  const cleanName = farmName.trim().toLowerCase();

  // Initialize count if this is the first animal for this farm
  if (!farmCounts[cleanName]) {
    farmCounts[cleanName] = 1;
  } else {
    farmCounts[cleanName]++;
  }

  const count = farmCounts[cleanName].toString().padStart(2, '0');

  return `${cleanName}-${count}`;
}

module.exports = generateUniqueFarmId;
