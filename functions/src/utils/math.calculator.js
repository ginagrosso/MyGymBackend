
const calculateIMC = (weight, height) => {
    if (!weight || !height || weight <= 0 || height <= 0) {
        return null;
    }
    
    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);
    
    return parseFloat(imc.toFixed(2));
};

const calculateIdealWeight = (height) => {
    if (!height || height <= 0) {
        return null;
    }
    
    const idealWeight = (height - 100) * 0.9;
    
    return parseFloat(idealWeight.toFixed(2));
};

const calculateIdealWeightDevine = (height, gender) => {
    if (!height || height <= 0 || !gender) {
        return null;
    }
    
    const heightInInches = height / 2.54; 
    const baseHeight = 60; 
    
    let idealWeight;
    
    if (heightInInches <= baseHeight) {

        idealWeight = gender === 'female' ? 45.5 : 50;
    } else {
        const inchesAboveBase = heightInInches - baseHeight;
        const baseWeight = gender === 'female' ? 45.5 : 50;
        idealWeight = baseWeight + (2.3 * inchesAboveBase);
    }
    
    return parseFloat(idealWeight.toFixed(2));
};
const getIMCCategory = (imc) => {
    if (!imc || imc <= 0) {
        return 'desconocido';
    }
    
    if (imc < 18.5) {
        return 'bajo peso';
    } else if (imc >= 18.5 && imc < 25) {
        return 'normal';
    } else if (imc >= 25 && imc < 30) {
        return 'sobrepeso';
    } else {
        return 'obesidad';
    }
};

module.exports = {
    calculateIMC,
    calculateIdealWeight,
    calculateIdealWeightDevine,
    getIMCCategory,
};