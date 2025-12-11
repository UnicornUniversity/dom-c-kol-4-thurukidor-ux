/**
 * @typedef {object} Employee
 * @property {("male"|"female")} gender - Pohlaví.
 * @property {string} birthdate - Datum narození ve formátu ISO Date-Time.
 * @property {string} name - Jméno.
 * @property {string} surname - Příjmení.
 * @property {number} workload - Výše úvazku (10, 20, 30, 40).
 * @property {number} age - Věk zaměstnance (přidáno pro snadnější práci se statistikami).
 */

/**
 * Generuje seznam zaměstnanců na základě vstupních kritérií.
 * @param {object} dtoIn - Vstupní DTO s kritérii (count, age.min, age.max).
 * @returns {Employee[]} - Seznam vygenerovaných zaměstnanců.
 */
export function generateEmployeeData(dtoIn) {
    const MALE_NAMES = ["Jan", "Petr", "Pavel", "Tomáš", "Vratislav", "Jiří", "Martin", "Jakub"];
    const FEMALE_NAMES = ["Anna", "Jana", "Marie", "Hana", "Lenka", "Jiřina", "Klára", "Veronika"];

    const MALE_SURNAMES = ["Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Sýkora", "Jelínek", "Kučera"];
    const FEMALE_SURNAMES = ["Nováková", "Svobodová", "Dvořáková", "Černá", "Procházková", "Ptáčková", "Jelínková", "Kučerová"];

    const WORKLOADS = [10, 20, 30, 40];

    // Pomocná funkce pro náhodný výběr z pole
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // Náhodné číslo v rozsahu [min, max]
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const currentDate = new Date();
    
    // Maximální datum narození (nejmladší zaměstnanec - 'max' let před dneškem)
    const maxBirthdate = new Date();
    maxBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.min);
    
    // Minimální datum narození (nejstarší zaměstnanec - 'max' let před dneškem)
    const minBirthdate = new Date();
    minBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.max);
    
    // Hranice v milisekundách
    const maxTimestamp = maxBirthdate.getTime(); // nejmladší (timestamp blíž k současnosti)
    const minTimestamp = minBirthdate.getTime(); // nejstarší (timestamp dál od současnosti)

    // Přepočet data pro korektní výpočet věku
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
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
        
        // Náhodný timestamp v rozsahu [minTimestamp, maxTimestamp]
        const randomTimestamp = getRandomInt(minTimestamp, maxTimestamp);
        const birthdate = new Date(randomTimestamp).toISOString();

        // Výpočet věku
        const age = (currentDate.getTime() - randomTimestamp) / MS_PER_YEAR;

        const workload = getRandomElement(WORKLOADS);

        employees.push({
            gender,
            birthdate,
            name,
            surname,
            workload,
            age // Uložení věku pro snadnější výpočet statistik
        });
    }

    return employees;
}

/**
 * Pomocná funkce pro výpočet mediánu v seznamu čísel.
 * @param {number[]} arr - Seznam čísel.
 * @returns {number} - Medián.
 */
function calculateMedian(arr) {
    if (arr.length === 0) return 0;
    // Vytvoří kopii a setřídí, aby se neměnil originál
    const sortedArr = [...arr].sort((a, b) => a - b); 
    const mid = Math.floor(sortedArr.length / 2);
    
    if (sortedArr.length % 2 === 0) {
        // Sudý počet: průměr dvou středových hodnot
        return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    } else {
        // Lichý počet: středová hodnota
        return sortedArr[mid];
    }
}


/**
 * Počítá různé statistiky ze seznamu zaměstnanců.
 * @param {Employee[]} employees - Seznam zaměstnanců.
 * @returns {object} - Objekt se statistikami.
 */
export function getEmployeeStatistics(employees) {
    if (employees.length === 0) {
        return {
            employeeCount: 0,
            employeeCountByWorkload: { 10: 0, 20: 0, 30: 0, 40: 0 },
            averageAge: 0,
            minAge: 0,
            maxAge: 0,
            medianAge: 0,
            medianWorkload: 0,
            averageWorkloadForWomen: 0,
            sortedByWorkload: [],
        };
    }

    const ages = employees.map(e => e.age);
    const workloads = employees.map(e => e.workload);
    const women = employees.filter(e => e.gender === "female");

    // 1. Počet zaměstnanců
    const employeeCount = employees.length;

    // 2. Počet zaměstnanců podle výše úvazku
    const employeeCountByWorkload = workloads.reduce((acc, workload) => {
        acc[workload] = (acc[workload] || 0) + 1;
        return acc;
    }, { 10: 0, 20: 0, 30: 0, 40: 0 });

    // 3. Průměrný věk (zaokrouhleno na jedno desetinné místo)
    const averageAge = parseFloat((ages.reduce((sum, age) => sum + age, 0) / employeeCount).toFixed(1));

    // 4. Minimální věk
    const minAge = Math.floor(Math.min(...ages)); // Používáme Math.floor pro nejmladšího

    // 5. Maximální věk
    const maxAge = Math.ceil(Math.max(...ages)); // Používáme Math.ceil pro nejstaršího

    // 6. Medián věku
    const medianAge = calculateMedian(ages);

    // 7. Medián výše úvazku
    const medianWorkload = calculateMedian(workloads);

    // 8. Průměrná výše úvazku v rámci žen
    const averageWorkloadForWomen = women.length > 0 
        ? parseFloat((women.reduce((sum, woman) => sum + woman.workload, 0) / women.length).toFixed(1))
        : 0;
    
    // 9. Seznam zaměstnanců setříděných dle výše úvazku od nejmenšího po největší
    // Používáme Array.from pro vytvoření kopie a zachování původního pole
    const sortedByWorkload = Array.from(employees).sort((a, b) => a.workload - b.workload);

    return {
        employeeCount,
        employeeCountByWorkload,
        averageAge,
        minAge,
        maxAge,
        medianAge,
        medianWorkload,
        averageWorkloadForWomen,
        sortedByWorkload
    };
}


/**
 * Hlavní funkce, která generuje data a počítá statistiky.
 * @param {object} dtoIn - Vstupní DTO (count, age.min, age.max).
 * @returns {object} - Výstupní DTO se statistikami a setříděným seznamem.
 */
export function main(dtoIn) {
    // 1. Generování seznamu zaměstnanců
    const employees = generateEmployeeData(dtoIn);

    // 2. Zjištění potřebných hodnot (statistik)
    const statistics = getEmployeeStatistics(employees);

    // Vracíme výstupní DTO s požadovanou strukturou
    const dtoOut = {
        employeeCount: statistics.employeeCount,
        employeeCountByWorkload: statistics.employeeCountByWorkload,
        averageAge: statistics.averageAge,
        minAge: statistics.minAge,
        maxAge: statistics.maxAge,
        medianAge: statistics.medianAge,
        medianWorkload: statistics.medianWorkload,
        averageWorkloadForWomen: statistics.averageWorkloadForWomen,
        // Důležité: 'sortedByWorkload' je pole zaměstnanců. 
        // Vracíme původní objekty bez klíče 'age', který byl přidán pro usnadnění výpočtů.
        sortedByWorkload: statistics.sortedByWorkload.map(emp => {
            const { age, ...rest } = emp; // Destrukturalizace pro odstranění 'age'
            return rest;
        })
    };

    return dtoOut;
}