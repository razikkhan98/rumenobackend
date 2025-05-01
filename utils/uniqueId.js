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
  



// // Generate Unique Id

// const farmCounts = {}; // Tracks count per full farm name

// function generateUniqueFarmId(farmName) {
//   const name = farmName.trim().toLowerCase();

//   // Initialize count if this is the first animal for this farm
//   if (!farmCounts[name]) {
//     farmCounts[name] = 1;
//   } else {
//     farmCounts[name]++;
//   }

//   const count = farmCounts[name].toString().padStart(2, '0');

//   return `${name.slice(0,4)}-${count}`;
// }

// module.exports = generateUniqueFarmId;









const farmCounts = {}; // Track count for each UID prefix
const baseNames = {};  // Map original farm names to their UID prefix

function generateUniqueFarmId(farmHouseName) {
  const name = farmHouseName.trim().toLowerCase();
  const base = name.slice(0, 4); // take first 4 letters for ID prefix

  let prefix;

  // If this exact farm name is already registered, reuse its prefix
  if (baseNames[name]) {
    prefix = baseNames[name];
  } else {
    // Check how many prefixes already start with the same base
    const similarPrefixes = Object.values(baseNames).filter(p => p.startsWith(base));
    const suffix = similarPrefixes.length === 0 ? '' : similarPrefixes.length.toString();

    prefix = `${base}${suffix}`;
    baseNames[name] = prefix;
  }

  // Initialize count for this prefix if needed
  if (!farmCounts[prefix]) {
    farmCounts[prefix] = 1;
  } else {
    farmCounts[prefix]++;
  }

  const count = farmCounts[prefix].toString().padStart(2, '0');
  return `${prefix}-${count}`;
}

module.exports = generateUniqueFarmId;
