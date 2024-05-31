import React, { useState, useEffect } from 'react';
import { decode } from 'html-entities';

// Utility function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export default function App() {
    // Initialize game
    const [startNewGame, setStartNewGame] = useState(false);
    // Data
    const [data, setData] = useState(null);
    // Track selected answers for each question
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    // Show answers
    const [revealAnswers, setRevealAnswers] = useState(false);
    // Track if the game is over
    const [gameOver, setGameOver] = useState(false);
    // Score
    const [score, setScore] = useState(0);

    const startGame = () => {
        setStartNewGame(true);
        console.log('start game!');
    };

    // Data fetching
    const fetchData = async () => {
        const response = await fetch('https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple');
        if (response.ok) {
            const data = await response.json();
            
            // Shuffle answers for each question
            const shuffledData = data.results.map(question => {
                const answers = [...question.incorrect_answers, question.correct_answer];
                return {
                    ...question,
                    answers: shuffleArray(answers)
                };
            });
            
            setData({ results: shuffledData });
            // Initialize selected answers array with null values for each question
            setSelectedAnswers(Array(data.results.length).fill(null));
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Function to handle selecting an answer for a specific question
    const selectAnswer = (index, answer) => {
        if (!revealAnswers) {
            const newSelectedAnswers = [...selectedAnswers];
            newSelectedAnswers[index] = answer;
            setSelectedAnswers(newSelectedAnswers);
        }
    };

    // Function to reveal the correct answers
    const revealCorrectAnswers = () => {
        if (revealAnswers) {
            resetGame();
        } else {
            setRevealAnswers(true);
            let correctCount = 0;
            selectedAnswers.forEach((answer, index) => {
                if (answer === data.results[index].correct_answer) {
                    correctCount++;
                }
            });
            setScore(correctCount);
            setGameOver(true);
        }
    };

    // Function to reset the game
    const resetGame = () => {
        setRevealAnswers(false);
        setGameOver(false);
        setScore(0);
        fetchData();
    };

    return (
        <main className="container">
            {startNewGame ? (
                <div className="quiz-container">
                    {data && data.results.map((question, index) => (
                        <div key={index} className="quiz-elements">
                            <h2>{decode(question.question)}</h2>
                            <div className="quiz-answers">
                                {question.answers.map((answer, idx) => (
                                    <p
                                      key={idx}
                                      className={`${revealAnswers && answer !== question.correct_answer && selectedAnswers[index] === answer ? 'incorrect' : ''}
                                                  ${revealAnswers && answer === question.correct_answer ? 'correct' : ''}
                                                  ${selectedAnswers[index] === answer && !revealAnswers ? 'selected' : ''}
                                                  ${revealAnswers && selectedAnswers[index] !== answer ? 'faded' : ''}`}
                                      onClick={() => selectAnswer(index, answer)}
                                    >{decode(answer)}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="score-container">
                        {revealAnswers && <p className="score">Score: {score}/5</p>}
                        <button className="score-btn" onClick={revealCorrectAnswers} disabled={selectedAnswers.includes(null)}>
                            {revealAnswers ? 'Play Again' : 'Check Answers'}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <h1 className="title">Quizzical</h1>
                    <p className="description">Some description if needed</p>
                    <button onClick={startGame}>Start quiz</button>
                </div>
            )}
        </main>
    );
}
