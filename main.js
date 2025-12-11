/**
 * @typedef {object} Employee
 * @property {("male"|"female")} gender - Pohlaví.
 * @property {string} birthdate - Datum narození ve formátu ISO Date-Time.
 * @property {string} name - Jméno.
 * @property {string} surname - Příjmení.
 * @property {number} workload - Výše úvazku (10, 20, 30, 40).
 * @property {number} ageDecimal - Věk jako reálné číslo (interně pro averageAge).
 * @property {number} ageInteger - Věk jako celé číslo (interně pro minAge/maxAge/medianAge).
 */

/**
 * Pomocná funkce pro výpočet mediánu v seznamu čísel.
 * @param {number[]} arr - Seznam čísel.
 * @returns {number} - Medián.
 */
function calculateMedian(arr) {
    if (arr.length === 0) return 0;
    // Vytvoří kopii a setřídí pro numerické řazení
    const sortedArr = [...arr].sort((a, b) => a - b); 
    const mid = Math.floor(sortedArr.length / 2);
    
    if (sortedArr.length % 2 === 0) {
        // Sudý počet: průměr dvou středových hodnot
        return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    } else {
        // Lichý počet: prostřední hodnota
        return sortedArr[mid];
    }
}

/**
 * Generuje seznam zaměstnanců na základě vstupních kritérií.
 * Tuto funkci jsme sice upravovali, ale je nutné ji zahrnout.
 * @param {object} dtoIn - Vstupní DTO s kritérii (count, age.min, age.max).
 * @returns {Employee[]} - Seznam vygenerovaných zaměstnanců.
 */
export function generateEmployeeData(dtoIn) {
    const MALE_NAMES = ["Jan", "Petr", "Pavel", "Tomáš", "Vratislav", "Jiří", "Martin", "Jakub"];
    const FEMALE_NAMES = ["Anna", "Jana", "Marie", "Hana", "Lenka", "Jiřina", "Klára", "Veronika"];

    const MALE_SURNAMES = ["Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Sýkora", "Jelínek", "Kučera"];
    const FEMALE_SURNAMES = ["Nováková", "Svobodová", "Dvořáková", "Černá", "Procházková", "Ptáčková", "Jelínková", "Kučerová"];

    const WORKLOADS = [10, 20, 30, 40];
    // Použijeme přesnější konstantu pro rok (365.25 dnů)
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Výpočet celočíselného věku (Years past birthday)
    const calculateIntegerAge = (birthdate, now) => {
        let age = now.getFullYear() - birthdate.getFullYear();
        const m = now.getMonth() - birthdate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birthdate.getDate())) {
            age--;
        }
        return age;
    };

    const currentDate = new Date();
    
    // Generování časových razítek v rozmezí [maxAge, minAge]
    const maxBirthdate = new Date();
    maxBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.min);
    
    const minBirthdate = new Date();
    minBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.max);
    
    const maxTimestamp = maxBirthdate.getTime(); 
    const minTimestamp = minBirthdate.getTime(); 

    const employees = [];

    for (let i = 0; i < dtoIn.count; i++) {
        const gender = getRandomElement(["male", "female"]);
        
        let name, surname;
        if (gender === "male") {
            name = getRandomElement(MALE_NAMES);
            surname = getRandomElement(MALE_SURNAMES);
        } else {
            name = getRandomElement(FEMALE_NAMES);
            surname = getRandomElement(FEMALE_SURNAMES);
        }
        
        const randomTimestamp = getRandomInt(minTimestamp, maxTimestamp);
        const birthDateObj = new Date(randomTimestamp);
        const birthdate = birthDateObj.toISOString();

        // 1. Věk jako reálné číslo (pro averageAge)
        const ageDecimal = (currentDate.getTime() - randomTimestamp) / MS_PER_YEAR;
        
        // 2. Věk jako celé číslo (pro minAge, maxAge, medianAge)
        const ageInteger = calculateIntegerAge(birthDateObj, currentDate);

        const workload = getRandomElement(WORKLOADS);

        employees.push({
            gender,
            birthdate,
            name,
            surname,
            workload,
            ageDecimal,
            ageInteger // Interní data
        });
    }

    return employees;
}


/**
 * Počítá statistiky dle nových požadavků na klíče a datové typy.
 * @param {Employee[]} employees - Seznam zaměstnanců (výstup generateEmployeeData).
 * @returns {object} - Objekt se statistikami.
 */
export function getEmployeeStatistics(employees) {
    if (employees.length === 0) {
        return {
            totalCount: 0,
            workloadsCount: { 10: 0, 20: 0, 30: 0, 40: 0 },
            averageAge: 0,
            minAge: 0,
            maxAge: 0,
            medianAge: 0,
            medianWorkload: 0,
            averageFemaleWorkload: 0,
            sortedByWorkload: [],
        };
    }

    const decimalAges = employees.map(e => e.ageDecimal);
    const integerAges = employees.map(e => e.ageInteger);
    const workloads = employees.map(e => e.workload);
    const females = employees.filter(e => e.gender === "female");

    const totalCount = employees.length;

    // 1. workloadsCount: Počet osob pro každou ze čtyř kategorií (Objekt)
    const workloadsCount = workloads.reduce((acc, workload) => {
        // Klíče jsou čísla: { 10: X, 20: Y, ... }
        acc[workload] = (acc[workload] || 0) + 1;
        return acc;
    }, { 10: 0, 20: 0, 30: 0, 40: 0 });

    // 2. averageAge: Průměrný věk (reálné číslo, zaokrouhlené na jedno desetinné místo)
    const averageAge = parseFloat((decimalAges.reduce((sum, age) => sum + age, 0) / totalCount).toFixed(1));

    // 3./4. minAge / maxAge (celé číslo)
    const minAge = Math.min(...integerAges); 
    const maxAge = Math.max(...integerAges); 

    // 5. medianAge (z celých čísel)
    const medianAge = calculateMedian(integerAges);

    // 6. medianWorkload
    const medianWorkload = calculateMedian(workloads);

    // 7. averageFemaleWorkload
    const averageFemaleWorkload = females.length > 0 
        ? parseFloat((females.reduce((sum, female) => sum + female.workload, 0) / females.length).toFixed(1))
        : 0;
    
    // 8. sortedByWorkload: Seznam setříděný numericky podle úvazku (od nejmenšího po největší)
    const sortedByWorkload = Array.from(employees).sort((a, b) => a.workload - b.workload);

    return {
        totalCount,
        workloadsCount,
        averageAge,
        minAge,
        maxAge,
        medianAge,
        medianWorkload,
        averageFemaleWorkload,
        sortedByWorkload
    };
}


/**
 * Hlavní funkce, která generuje data a počítá statistiky.
 * Vrací výstupní DTO (dtoOut) se správnou strukturou.
 * @param {object} dtoIn - Vstupní DTO (count, age.min, age.max).
 * @returns {object} - Výstupní DTO se statistikami a setříděným seznamem.
 */
export function main(dtoIn) {
    // 1. Generování dat
    const employees = generateEmployeeData(dtoIn);

    // 2. Výpočet statistik
    const statistics = getEmployeeStatistics(employees);

    // 3. Sestavení finálního DTO s přesnými názvy klíčů
    const dtoOut = {
        // totalCount: Celkový počet osob
        totalCount: statistics.totalCount, 
        
        // workloadsCount: Počet osob pro každou ze čtyř kategorií úvazku
        // Dle požadavku na Úkol 4 se očekává, že klíče 10, 20, 30, 40 budou uvnitř tohoto objektu
        workloadsCount: statistics.workloadsCount,
        
        // Ostatní statistiky
        averageAge: statistics.averageAge,
        minAge: statistics.minAge,
        maxAge: statistics.maxAge,
        medianAge: statistics.medianAge,
        medianWorkload: statistics.medianWorkload,
        averageFemaleWorkload: statistics.averageFemaleWorkload, 
        
        // Seznam setříděný podle úvazku (odstraníme interní klíče ageDecimal/ageInteger)
        sortedByWorkload: statistics.sortedByWorkload.map(emp => {
            const { ageDecimal, ageInteger, ...rest } = emp; 
            return rest;
        })
    };

    return dtoOut;
}