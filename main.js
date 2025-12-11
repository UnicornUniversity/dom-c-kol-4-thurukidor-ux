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

    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const currentDate = new Date();
    
    // Výpočet hraničních dat pro generování datumu narození
    const maxBirthdate = new Date();
    maxBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.min);
    
    const minBirthdate = new Date();
    minBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.max);
    
    const maxTimestamp = maxBirthdate.getTime(); 
    const minTimestamp = minBirthdate.getTime(); 

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
        
        const randomTimestamp = getRandomInt(minTimestamp, maxTimestamp);
        const birthdate = new Date(randomTimestamp).toISOString();

        const age = (currentDate.getTime() - randomTimestamp) / MS_PER_YEAR;

        const workload = getRandomElement(WORKLOADS);

        employees.push({
            gender,
            birthdate,
            name,
            surname,
            workload,
            age 
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
    const sortedArr = [...arr].sort((a, b) => a - b); 
    const mid = Math.floor(sortedArr.length / 2);
    
    if (sortedArr.length % 2 === 0) {
        return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    } else {
        return sortedArr[mid];
    }
}


/**
 * Počítá různé statistiky ze seznamu zaměstnanců.
 * Poznámka: Klíče pro počty úvazků jsou ve formátu 'workloadX', 
 * což je příprava pro správné mapování v main().
 * @param {Employee[]} employees - Seznam zaměstnanců.
 * @returns {object} - Objekt se statistikami.
 */
export function getEmployeeStatistics(employees) {
    if (employees.length === 0) {
        return {
            employeeCount: 0,
            employeeCountByWorkload: { workload10: 0, workload20: 0, workload30: 0, workload40: 0 },
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

    const employeeCount = employees.length;

    // Počet zaměstnanců podle výše úvazku - klíče ve formátu 'workloadX'
    const employeeCountByWorkload = workloads.reduce((acc, workload) => {
        const key = `workload${workload}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, { workload10: 0, workload20: 0, workload30: 0, workload40: 0 });

    // Průměrný věk (zaokrouhleno na jedno desetinné místo)
    const averageAge = parseFloat((ages.reduce((sum, age) => sum + age, 0) / employeeCount).toFixed(1));

    // Min/Max věk (zaokrouhleno)
    const minAge = Math.floor(Math.min(...ages)); 
    const maxAge = Math.ceil(Math.max(...ages)); 

    const medianAge = calculateMedian(ages);
    const medianWorkload = calculateMedian(workloads);

    // Průměrná výše úvazku v rámci žen
    const averageWorkloadForWomen = women.length > 0 
        ? parseFloat((women.reduce((sum, woman) => sum + woman.workload, 0) / women.length).toFixed(1))
        : 0;
    
    // Seznam zaměstnanců setříděných dle výše úvazku od nejmenšího po největší
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
 * Zajišťuje správnou strukturu výstupního DTO.
 * @param {object} dtoIn - Vstupní DTO (count, age.min, age.max).
 * @returns {object} - Výstupní DTO se statistikami a setříděným seznamem.
 */
export function main(dtoIn) {
    const employees = generateEmployeeData(dtoIn);
    const statistics = getEmployeeStatistics(employees);
    
    // Rozbalení (flattening) počtů úvazků na nejvyšší úroveň
    const workloadCounts = statistics.employeeCountByWorkload; 

    // Sestavení finálního DTO přesně podle požadované ukázky
    const dtoOut = {
        // Klíč 'total' odpovídá celkovému počtu zaměstnanců
        total: statistics.employeeCount, 
        
        // Přidání klíčů workload10, workload20, atd. na nejvyšší úroveň
        ...workloadCounts, 
        
        averageAge: statistics.averageAge,
        minAge: statistics.minAge,
        maxAge: statistics.maxAge,
        medianAge: statistics.medianAge,
        medianWorkload: statistics.medianWorkload,
        // Přejmenování klíče z 'averageWorkloadForWomen' na 'averageWomenWorkload'
        averageWomenWorkload: statistics.averageWorkloadForWomen, 
        
        // Odstranění dočasného klíče 'age' z objektů v seznamu
        sortedByWorkload: statistics.sortedByWorkload.map(emp => {
            const { age, ...rest } = emp; 
            return rest;
        })
    };

    return dtoOut;
}