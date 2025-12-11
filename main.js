// SEKVENACE: konstanty pro generovani dat
const M_NAMES = ["Jan", "Petr", "Pavel", "Tomáš", "Vratislav", "Jiří", "Martin", "Jakub"];
const F_NAMES = ["Anna", "Jana", "Marie", "Hana", "Lenka", "Jiřina", "Klára", "Veronika"];
const M_SURNAMES = ["Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Sýkora", "Jelínek", "Kučera"];
const F_SURNAMES = ["Nováková", "Svobodová", "Dvořáková", "Černá", "Procházková", "Ptáčková", "Jelínková", "Kučerová"];
const W_LOADS = [10, 20, 30, 40];
const MS_IN_YEAR = 365.25 * 24 * 60 * 60 * 1000;

// POMOCNY ALGORITMUS: vyber nahodneho prvku z pole
const chooseRandom = (array) => array[Math.floor(Math.random() * array.length)];

// POMOCNY ALGORITMUS: vrati nahodne cele cislo v rozsahu [min, max]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// POMOCNY ALGORITMUS: zaokrouhli cislo na dany pocet desetinnych mist
const toPrecision = (num, decimals) => Math.round(num * 10 ** decimals) / 10 ** decimals;

// ALGORITMUS: vypocet medianu
function calculateMedian(arr) {
    // SELECTION: kontrola prazdneho pole
    if (arr.length === 0) return 0;
    
    // SEKVENACE: serazeni a urceni stredu
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    // SELECTION: vypocet pro sudy nebo lichy pocet prvku
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

// ALGORITMUS: generovani dat zamestnancu
export function generateEmployeeData(dtoIn) {
    // SEKVENACE: inicializace aktualniho data
    const currentDate = new Date();
    
    // SEKVENACE: vypocet casovych razitek pro rozsah veku
    const maxBirthdate = new Date();
    maxBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.min);
    
    const minBirthdate = new Date();
    minBirthdate.setFullYear(currentDate.getFullYear() - dtoIn.age.max);
    
    const maxTimestamp = maxBirthdate.getTime(); 
    const minTimestamp = minBirthdate.getTime(); 
    
    const employees = [];

    // ITERACE: smycka pro generovani zamestnancu
    for (let i = 0; i < dtoIn.count; i++) {
        // SEKVENACE: urceni pohlavi
        const gender = chooseRandom(["male", "female"]);
        
        let name, surname;
        // SELECTION: vyber jmena a prijmeni dle pohlavi
        if (gender === "male") {
            name = chooseRandom(M_NAMES);
            surname = chooseRandom(M_SURNAMES);
        } else {
            name = chooseRandom(F_NAMES);
            surname = chooseRandom(F_SURNAMES);
        }
        
        // SEKVENACE: generovani data narozeni a vypocet dekadickeho veku
        const randomTimestamp = randomInt(minTimestamp, maxTimestamp);
        const birthdate = new Date(randomTimestamp).toISOString();

        // LOGIKA: dekadicky vek pro presne vypocty
        const ageDecimal = (currentDate.getTime() - randomTimestamp) / MS_IN_YEAR;
        
        // SEKVENACE: pridani noveho zamestnance
        employees.push({
            gender,
            birthdate,
            name,
            surname,
            workload: chooseRandom(W_LOADS),
            ageDecimal, // pomocny klic
        });
    }

    // RETURN: vraci pole zamestnancu
    return employees;
}


// ALGORITMUS: spocita statisticke udaje
export function getEmployeeStatistics(employeeList) {
    // SEKVENACE: Celkovy pocet.
    const total = employeeList.length;

    // SEKVENACE: mapovani hodnot pro vypocty
    const ageValues = employeeList.map(emp => emp.ageDecimal);
    const workloadValues = employeeList.map(emp => emp.workload);

    // SEKVENACE: pocty uvazku (Reduce)
    const workloadsCountMap = workloadValues.reduce((acc, w) => {
        acc[w] = (acc[w] || 0) + 1;
        return acc;
    }, { 10: 0, 20: 0, 30: 0, 40: 0 });

    // SEKVENACE: filtrovani zen a jejich uvazku
    const females = employeeList.filter(e => e.gender === "female");
    const femaleWorkloadValues = females.map(e => e.workload);
    
    // POMOCNY ALGORITMUS: funkce pro vypocet prumeru
    const calculateMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    // SEKVENACE: prumerny vek (zaokrouhleny)
    const averageAge = toPrecision(calculateMean(ageValues), 1);
    
    // SEKVENACE: Min/Max/median vek (Math.floor)
    const minAge = Math.floor(Math.min(...ageValues));
    const maxAge = Math.floor(Math.max(...ageValues));
    const medianAge = Math.floor(calculateMedian(ageValues));

    // SEKVENACE: median uvazku
    const medianWorkload = toPrecision(calculateMedian(workloadValues), 1);
    
    // SELECTION: prumerny uvazek zen (kontrola deleni nulou)
    const averageWomenWorkload = femaleWorkloadValues.length > 0 
        ? toPrecision(calculateMean(femaleWorkloadValues), 1) 
        : 0;

    // SEKVENACE: serazeni celeho seznamu podle uvazku
    const sortedByWorkload = [...employeeList].sort((a, b) => a.workload - b.workload);

    // RETURN: vraci statistiky v ploche strukture
    return {
        total,
        workload10: workloadsCountMap[10],
        workload20: workloadsCountMap[20],
        workload30: workloadsCountMap[30],
        workload40: workloadsCountMap[40],
        averageAge,
        minAge,
        maxAge,
        medianAge,
        medianWorkload,
        averageWomenWorkload,
        sortedByWorkload
    };
}

// ALGORITMUS: hlavni ridici funkce
export function main(dtoIn) {
    // ALGORITMUS CALL: generovani dat
    const employeeData = generateEmployeeData(dtoIn);
    
    // ALGORITMUS CALL: vypocet statistik
    const statistics = getEmployeeStatistics(employeeData);

    // SEKVENACE: odstraneni klice 'ageDecimal' z celeho serazeneho seznamu
    const cleanedSortedList = statistics.sortedByWorkload.map(emp => {
        const { ageDecimal, ...rest } = emp; 
        return rest;
    });
    
    // SEKVENACE: sestaveni finalniho DTO
    const dtoOut = {
        ...statistics,
        sortedByWorkload: cleanedSortedList,
    };

    // RETURN: vraci finalni DTO
    return dtoOut;
}