/**
 * Analyzes data structure and returns schema information for each column
 * @param {Array} data - Array of data objects
 * @returns {Array} Array of column schema objects
 */
export function schema(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  return columns.map((column, index) => {
    const values = data.map(row => row[column]).filter(val => val != null && val !== '');
    
    if (values.length === 0) {
      return createEmptyColumnSchema(column, index);
    }

    // Determine data types
    const types = new Set();
    values.forEach(val => {
      if (typeof val === 'number' && !isNaN(val)) {
        types.add('number');
      } else if (typeof val === 'string') {
        types.add('string');
      } else if (typeof val === 'boolean') {
        types.add('boolean');
      }
    });

    const dataTypes = Array.from(types);
    const primaryType = dataTypes.includes('number') ? 'number' : 
                       dataTypes.includes('string') ? 'string' : 
                       dataTypes[0] || 'string';

    // Create format information based on primary type
    let format;
    if (primaryType === 'number') {
      const numericValues = values.filter(val => typeof val === 'number' && !isNaN(val));
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const hasEmptyValues = values.length < data.length;
      
      format = {
        min: min,
        max: max,
        scale: 'scaleLinear',
        hasEmptyValues: hasEmptyValues,
        sequential: isSequential(numericValues),
        strictly: true
      };
    } else {
      const uniqueValues = new Set(values);
      const longest = Math.max(...values.map(val => String(val).length));
      
      format = {
        hasRepeat: uniqueValues.size < values.length,
        longest: longest,
        scale: uniqueValues.size <= 10 ? 'scaleOrdinal' : 'scaleBand'
      };
    }

    return {
      column: column,
      index: index,
      label: column,
      dataTypes: dataTypes,
      formats: [{
        type: primaryType,
        format: format
      }]
    };
  });
}

function createEmptyColumnSchema(column, index) {
  return {
    column: column,
    index: index,
    label: column,
    dataTypes: ['string'],
    formats: [{
      type: 'string',
      format: {
        hasRepeat: false,
        longest: 0,
        scale: 'scaleOrdinal'
      }
    }]
  };
}

function isSequential(values) {
  if (values.length < 2) return false;
  
  const sorted = [...values].sort((a, b) => a - b);
  const differences = [];
  
  for (let i = 1; i < sorted.length; i++) {
    differences.push(sorted[i] - sorted[i-1]);
  }
  
  // Check if differences are roughly consistent (within 10% variance)
  const avgDiff = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  const variance = differences.every(diff => Math.abs(diff - avgDiff) / avgDiff < 0.1);
  
  return variance;
} 