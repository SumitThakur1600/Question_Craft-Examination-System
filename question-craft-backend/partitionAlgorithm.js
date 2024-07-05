const partitionQuestions = (questions) => {
    // Step 1: Input Validation
    if (!Array.isArray(questions)) {
        throw new Error("Invalid input: Questions must be provided in an array");
    }

    if (questions.length < 3) {
        throw new Error("Invalid input: At least 3 questions are required to partition into 3 sets");
    }
    // Step 2: Count Questions by Difficulty Level
    const counts = { 'Easy': 0, 'Medium': 0, 'Hard': 0 };
    questions.forEach(question => {
        if (question && typeof question === 'object') {
            if (!question.DifficultyLevel) {
                throw new Error(`DifficultyLevel is missing for question: ${JSON.stringify(question)}`);
            }
            if (typeof question.DifficultyLevel !== 'string') {
                throw new Error(`DifficultyLevel should be a string, but got ${typeof question.DifficultyLevel} for question: ${JSON.stringify(question)}`);
            }
            const difficultyLevel = question.DifficultyLevel.trim();
            if (['Easy', 'Medium', 'Hard'].includes(difficultyLevel)) {
                counts[difficultyLevel]++;
            } else {
                throw new Error(`Unknown difficulty level encountered for question: ${JSON.stringify(question)}`);
            }
        } else {
            throw new Error(`Invalid question object: ${JSON.stringify(question)}`);
        }
    });
    //step3
    const totalQuestions = questions.length;
    const minQuestionsPerSet = Math.floor(totalQuestions / 3);
    const remainder = totalQuestions % 3;

    if (remainder !== 0) {
        // Sort questions by difficulty level descending (Hard -> Medium -> Easy)
        questions.sort((a, b) => {
            const levelOrder = ['Hard', 'Medium', 'Easy'];
            return levelOrder.indexOf(b.DifficultyLevel) - levelOrder.indexOf(a.DifficultyLevel);
        });

        const difficultyLevels = ['Hard', 'Medium', 'Easy'];
        let removedCount = 0;

        for (const level of difficultyLevels) {
            if (removedCount >= remainder) break;

            let i = 0;
            while (counts[level] > minQuestionsPerSet && removedCount < remainder && i < questions.length) {
                if (questions[i].DifficultyLevel === level) {
                    questions.splice(i, 1); // Remove the question from the array
                    counts[level]--;
                    removedCount++;
                    // No need to increment `i` since splice modifies the array in place
                } else {
                    i++;
                }
            }
        }
    }

    // Step 4: Shuffle questions to randomize distribution using Fisher-Yates shuffle algorithm
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    console.log(questions.length);
    // Step 5: Partition questions into sets ensuring no repetition and balanced complexity
    const sets = [[], [], []];
    const numQuestionsPerSet = Math.floor(totalQuestions / 3); // Each set should ideally get this many questions

    // Track used questions to avoid repetition
    const usedQuestions = new Set();
    // Distribute questions in round-robin across sets
    let setIndex = 0; // Start with set A
    // Sequential distribution of questions by difficulty level
    ['Hard', 'Medium', 'Easy'].forEach(level => {
        const filteredQuestions = questions.filter(question => question.DifficultyLevel === level);



        filteredQuestions.forEach(question => {
            // Find next set in round-robin fashion
            while (sets[setIndex].length >= numQuestionsPerSet) {
                setIndex = (setIndex + 1) % 3;
            }

            if (!usedQuestions.has(question)) {
                sets[setIndex].push(question);
                usedQuestions.add(question); // Mark question as used
                setIndex = (setIndex + 1) % 3; // Move to next set
            }
        });
    });
    let remainingQuestions = questions.filter(question => !usedQuestions.has(question));
    remainingQuestions.forEach(question => {
        // Find set with the least questions
        const minSetLength = Math.min(...sets.map(set => set.length));
        const minSetIndex = sets.findIndex(set => set.length === minSetLength);
        sets[minSetIndex].push(question);
    });
    console.log(sets[0].length);
    console.log(sets[1].length);
    console.log(sets[2].length);
    // Step 6: Return 
    return sets;
};

module.exports = { partitionQuestions };
