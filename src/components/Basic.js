import React, { useState, useRef, useEffect } from 'react';
import { IoMdSend } from 'react-icons/io';
import { BiBot, BiUser } from 'react-icons/bi';
import logo1 from './graph2.png';
import logo2 from './logo2.png';
import logo3 from './logo3.png';
import './chatBot.css'; // Import the CSS file


//import { BarChart } from 'react-simple-charts';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart }            from 'react-chartjs-2'
import { Doughnut } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';






function Basic() {
 
  // Inside the Basic component's state
  

  const [questionnaireResults, setQuestionnaireResults] = useState({});
 
  

  const [aiAssistantChat, setAiAssistantChat] = useState([
    { sender: 'bot', msg: "Hey 👋! I am Evva, your caregiving advocate. How can I help?" },
  ]);

  const [checkinChat, setCheckinChat] = useState([]);
  const [checkinQuestion, setCheckinQuestion] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [checkinInputMessage, setCheckinInputMessage] = useState('');
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinMode, setCheckinMode] = useState(false);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});
  const [weeklyCheckinAnswers, setWeeklyCheckinAnswers] = useState({});

  // Define questionnaireQuestionsEnabled and questionnaireQuestions
  const [questionnaireQuestionsEnabled, setQuestionnaireQuestionsEnabled] = useState(false); // Change the initial value as needed
  const [questionnaireQuestions, setQuestionnaireQuestions] = useState([]); // Initialize with your questionnaire questions


  // New chart
  const [chartData, setChartData] = useState(null);
  const [showDonutCharts, setShowDonutCharts] = useState(false);
 
  const [doughnutChartDatas, setDoughnutChartDatas] = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
 
  

  // Define a function to get color based on score
const getColorForScore = (score) => {
  if (score >= 5 && score <= 6) return 'green';
  if (score >= 2 && score <= 4) return 'yellow';
  return 'red';
};

const week0Data = {
  'Martha': {
    'Cognition': 0,
    'Social': 0,
    'Mobility': 0,
    'Mind': 0,
    'Independence (IADL)': 0,
    'Daily Activities': 0,
    // ... (add all titles and set their scores to 0)
  },
  // ... (add more patients if applicable)
};



// ... (your existing code)


  const fetchDataAndGenerateChart = () => {
    
    
      
    // Fetch data from the backend
    fetch('https://community-chatbot-gpt35turbo.vikrantth2013.repl.co/calculate_questionnaire_results')
      .then(response => response.json())
      .then(data => {
        // Process data to create chartData for the bar chart
        const labels = Object.keys(data['Martha']);
        const scores = Object.values(data['Martha']);

        
        const combinedData = {
          week0: week0Data,
          week1: data, // This is the current data from the backend
        };
        
                
        
  
        const chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Scores',
              data: scores,
              backgroundColor: scores.map(score => {
                if (score >= 5 && score <= 6) return 'green';
                if (score >= 2 && score <= 4) return 'yellow';
                return 'red';
              }),
              borderColor: scores.map(score => {
                if (score >= 5 && score <= 6) return 'green';
                if (score >= 2 && score <= 4) return 'yellow';
                return 'red';
              }),
              borderWidth: 1,
            },
          ],
        };
  
        setChartData(chartData);
        setShowDonutCharts(true); 
      // Set showDonutCharts to true after fetching data



        
  
        // Process data to create doughnutChartDatas for the doughnut charts
        const doughnutChartDatas = Object.entries(data).map(([patient, patientResults]) => {
          const doughnutData = Object.entries(patientResults).map(([title, score]) => {
            let x;
            if (score >= 5 && score <= 6) {
              x = 'green';
            } else if (score >= 2 && score <= 4) {
              x = 'yellow';
            } else {
              x = 'red';
            }
            return {
              
              labels: ['Score', 'Remaining',title],
              datasets: [
                {
                  data: [score, 6 - score],
                  backgroundColor: [x, 'gray'],
                },
              ],
            };
          });
          return {
            patient: patient,
            doughnutData: doughnutData,
          };
        });
        setDoughnutChartDatas(doughnutChartDatas);

        const lineChartLabels = ['Week 0', 'Week 1'];
        const lineChartData = Object.entries(combinedData).map(([week, weekData]) => {
          return {
            label: week,
            data: Object.values(weekData['Martha']), // Assuming 'Martha' is the patient name
            borderColor: getColorForScore(weekData['Martha']['Title 1']), // Use the getColorForScore function
            borderWidth: 2,
            fill: false,
          };
        });
        
      setLineChartData(lineChartData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };
  
  const calculateTotalScore = () => {
    if (chartData) {
      const totalScore = chartData.datasets[0].data.reduce((sum, score) => sum + score, 0);
      return totalScore;
    }
    return 0;
  };

  const calculateTotalStatus = (totalScore) => {
    if (totalScore >= 0 && totalScore <= 8) return 'Full assistance required';
    if (totalScore >= 9 && totalScore <= 20) return 'Significant assistance required';
    if (totalScore >= 21 && totalScore <= 30) return 'Some assistance required';
    if (totalScore >= 31 && totalScore <= 36) return 'Independent';
    return '';
  };



  const completeCheckin = () => {
    setShowCheckin(false);
    setCheckinMode(false);
    setAiAssistantEnabled(true);
  };

  const startCheckin = async () => {
    try {
      const response = await fetch('https://community-chatbot-gpt35turbo.vikrantth2013.repl.co/get_question', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-SECRET': 'my secret', // Replace with your API secret
        },
      });

      if (response.ok) {
        const data = await response.json();
        const { question } = data;

        let formattedQuestion = question.question;
        if (question.options) {
          const formattedOptions = question.options.map((option, index) => `${index + 1}. ${option}`).join('<br />');
          formattedQuestion += '<br />' + formattedOptions;
          formattedQuestion = formattedQuestion.replace(/(\d+\.)\s*\d+\./g, '$1'); // Remove duplicate numbers
        }

        const newBotMessage = {
          sender: 'bot',
          msg: formattedQuestion,
        };

        setCheckinQuestion(formattedQuestion);
        setCheckinChat((prevChat) => [...prevChat, newBotMessage]);
        setShowCheckin(true);
        setCheckinMode(true);
        setAiAssistantEnabled(false);
      } else {
        console.error('Request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleNextQuestion = () => {
  if (showCheckin && !questionnaireQuestionsEnabled) {
    startCheckin(); // Start weekly check-in
  } else if (showCheckin && questionnaireQuestionsEnabled) {
    startQuestionnaire(); // Start questionnaire
  }
};
  const handleResumeAssistant = () => {
    setAiAssistantEnabled(true);
  };

  const handleAiAssistantSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage !== '') {
      try {
        setAiAssistantChat((prevChat) => [...prevChat, { sender: 'user', msg: inputMessage }]);
        const response = await fetch('https://community-chatbot-gpt35turbo.vikrantth2013.repl.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: 'my secret', // Replace with your API secret
            question: inputMessage,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const { answer } = data;
          // Split the answer text by full stops and join with line breaks
          const answerLines = answer.split('. ');
          const formattedAnswer = answerLines.join('.\n');
          
          setAiAssistantChat((prevChat) => [...prevChat, { sender: 'bot', msg: formattedAnswer }]);
        } else {
          console.error('Request failed with status:', response.status);
        }
      } catch (error) {
        console.error('Error:', error);
      }

      setInputMessage('');
    }
  };

  const handlePerformAction = async () => {
    try {
      const response = await fetch('https://community-chatbot-gpt35turbo.vikrantth2013.repl.co/perform_action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Action performed successfully.');
      } else {
        console.error('Request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const startQuestionnaire = async () => {
    try {
      const response = await fetch('https://community-chatbot-gpt35turbo.vikrantth2013.repl.co/get_questionnaire_question', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        const { question, options } = data;
  
        let formattedMessage = question;
        if (options && Array.isArray(options)) {
          const formattedOptions = options.map((option, index) => `${index + 1}. ${option}`).join('\n');
          formattedMessage += '\n\nOptions:\n' + formattedOptions;
        }
  
        const newBotMessage = {
          sender: 'bot',
          msg: formattedMessage,
        };
  
        setCheckinChat((prevChat) => [...prevChat, newBotMessage]);
        setShowCheckin(true);
        setCheckinMode(true);
        setAiAssistantEnabled(false);
        setQuestionnaireQuestionsEnabled(true); // Update this line to enable questionnaire mode
      } else {
        console.error('Request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const handleCheckinSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    
    if (checkinInputMessage !== '') {
      const newChatMessage = {
        sender: 'user',
        msg: checkinInputMessage,
      };
    
      setCheckinChat((prevChat) => [...prevChat, newChatMessage]);
      setCheckinInputMessage('');
    
      if (checkinMode) {
        try {
          const endpoint = questionnaireQuestionsEnabled
            ? 'submit_questionnaire_answer'
            : 'submit_answer';
    
          const response = await fetch(`https://community-chatbot-gpt35turbo.vikrantth2013.repl.co/${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-SECRET': 'my secret', // Replace with your API secret
            },
            body: JSON.stringify({ answer: checkinInputMessage }),
          });
    
          if (response.ok) {
            const data = await response.json();
            const { module, question } = data;
    
            if (module === 'questionnaire') {
              // Handle questionnaire-specific logic here
              
              const questionIndex = question.question_index;
              const questionId = `Q${questionIndex}`;
              setQuestionnaireAnswers((prevAnswers) => ({
                ...prevAnswers,
                [questionId]: { response: checkinInputMessage },
              }));
    
              if (questionIndex === questionnaireQuestions.length - 1) {
                completeCheckin();
                return;
              }
            } else if (module === 'weekly_checkin') {
              // Handle weekly check-in logic here
              const currentQuestion = question.current_question;
              setWeeklyCheckinAnswers((prevAnswers) => ({
                ...prevAnswers,
                [currentQuestion]: checkinInputMessage,
              }));
            }
    
            if (question && question.question) {
              let formattedQuestion = question.question;
              if (question.options) {
                formattedQuestion = formattedQuestion.replace(/\d+\.\s*/, '');
                const formattedOptions = question.options.map((option, index) => `${index + 1}. ${option}`).join('\n');
                formattedQuestion += '\n' + formattedOptions;
              }
              setCheckinQuestion(formattedQuestion);
            }
          } else {
            console.error('Request failed with status:', response.status);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
  };
  
  
  const calculateStatus = (score) => {
    if (score >= 5 && score <= 6) return "Good";
    if (score >= 2 && score <= 4) return "Warning";
    return "Unsafe";
  };
  
  
  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-6 chatbot-col">
            <div className="card chatbot-chat">
              <div className="card-header">
                <h1>AI Care Advocate</h1>
              </div>
              <div className="card-body">
                <div className="message-area ai-assistant-chat">
                  {aiAssistantChat.map((message, index) => (
                    <div key={index} className={message.sender === 'bot' ? 'bot-message' : 'user-message'}>
                      {message.sender === 'bot' ? (
                        <>
                          <img className="bot-logo" src={require('./evvabot1.png')} alt="Bot Logo" />
                          <p>{message.msg}</p>
                        </>
                      ) : (
                        <>
                          <p>{message.msg}</p>
                          <BiUser className="message-icon" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer">
                <div>
                <form onSubmit={handleAiAssistantSubmit}>
                
                <div className="message-input">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={!aiAssistantEnabled}
                    className="input-field"
                  />
                  <button type="submit" disabled={!aiAssistantEnabled}>
                    <IoMdSend />
                  </button>
                  </div>
                </form>
                  <div className="button-group">
                    <button onClick={handleResumeAssistant} disabled={!aiAssistantEnabled}>
                    Resume the Assistant
                    </button>
                  
                    <button onClick={handlePerformAction} disabled={!aiAssistantEnabled}>
                      Train Data
                    </button>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 checkin-col">
            {showCheckin ? (
              <div className="card checkin-chat">
                <div className="card-header  full-width-header">
                  <h1>AI Care Manager</h1>
                </div>
                <div className="card-body">
                  <div className="message-area">
                    {checkinChat.map((message, index) => (
                      <div key={index} className={message.sender === 'bot' ? 'bot-message' : 'user-message'}>
                        {message.sender === 'bot' ? (
                          <>
                            <img className="bot-logo" src={require('./evvabot1.png')} alt="Bot Logo" />
                            <div dangerouslySetInnerHTML={{ __html: message.msg }} />
                          </>
                        ) : (
                          <>
                            <div dangerouslySetInnerHTML={{ __html: message.msg.replace(/\d+\./g, '') }} />
                            <BiUser className="message-icon" />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-footer">
                  <form onSubmit={handleCheckinSubmit}>
                    <input
                      type="text"
                      placeholder="Type your response..."
                      value={checkinInputMessage}
                      onChange={(e) => setCheckinInputMessage(e.target.value)}
                      disabled={!checkinMode}
                      className="input-field"
                    />
                    <button type="submit" disabled={!checkinMode}>
                      <IoMdSend />
                    </button>
                  </form>
                  <div className="button-group">
                    <button onClick={handleNextQuestion} disabled={aiAssistantEnabled}>
                      Next Question
                    </button>
                    
                  </div>
                </div>
              </div>
            ) : (
              <div className="card checkin-start-container">
                <div className="card-header  full-width-header">
                  <h1>AI Care Manager</h1>
                </div>
                <div className="card-body">
                  {/* ... Check-in start UI code ... */}
                </div>
                <div className="card-footer ">
                  <div className="button-group">
                    <button onClick={startCheckin} className="start-checkin-btn" disabled={!aiAssistantEnabled}>
                      Start Check-in
                    </button>
                    <button onClick={startQuestionnaire} className="start-checkin-btn" disabled={!aiAssistantEnabled}>
                      Start Questionnaire
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 results-col">
            <div className="card results">
              <div className="card-header">
                <h1>AI Care Manager Results</h1>
              </div>
              <div className="card-body">
                {Object.entries(questionnaireResults).map(([patient, patientResults]) => (
                  <div key={patient}>
                    <h3>{patient}</h3>
                    <ul>
                      {Object.entries(patientResults).map(([title, score]) => (
                        <li key={title}>
                          {title}: {score}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="button-group">
                <button onClick={fetchDataAndGenerateChart}>Show Results</button>
                </div>
                  {chartData ? (
                    <div>
                    <Bar
                      data={chartData}
                      options={{
                        scales: {
                          x: {
                            type: 'category',
                          },
                          y: {
                            beginAtZero: true,
                            max: 6,
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              title: tooltipItems => {
                                return tooltipItems[0].label;
                              },
                              label: (context) => {
                                const score = context.parsed.y;
                                let status = "";
                                if (score >= 5 && score <= 6) status = "Good";
                                else if (score >= 2 && score <= 4) status = "Warning";
                                else status = "Unsafe";
                                return `Score: ${score}\nStatus: ${status}`;
                              },
                            },
                          },
                          datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: (value, context) => {
                              if (value >= 5 && value <= 6) return 'Good';
                                  if (value >= 2 && value <= 4) return 'Moderate';
                                  return 'Warning';
                            },
                            color: (context) => (context.dataset.backgroundColor === 'red' ? 'white' : 'black'),
                            font: {
                              weight: 'bold',
                            },
                            position: 'top', // Adjust the position of the labels
                          },
                        },
                      }}
                    />
                    <div className="total-score">
                        <p>Total Score: <span>{calculateTotalScore()}</span></p>
                        <p>Status: <span>{calculateTotalStatus(calculateTotalScore())}</span></p>
                      </div>

                      
                  
                      
                      {showDonutCharts && doughnutChartDatas.map((doughnutChartData, index) => (
                        <div key={index} className="col-md-12 chart-col">
                          <div className="card chart">
                            <div className="card-body">
                              <h3>{doughnutChartData.patient}</h3>
                              {doughnutChartData.doughnutData.map((data, dataIndex) => (
                                <div key={dataIndex} className="donut-chart larger-donut">
                                  <h4>{data.title}</h4>
                                  <Doughnut
                                    data={data}
                                    options={{
                                      responsive: true,
                                      maintainAspectRatio: false,
                                      cutout: '50%',
                                      plugins: {
                                        legend: {
                                          display: true,
                                          position: 'bottom',
                                          align: 'center',
                                        },
                                        tooltip: {
                                          callbacks: {
                                            label: (context) => {
                                              const score = context.raw;
                                              let status = "";
                                              if (score >= 5 && score <= 6) status = "Good";
                                              else if (score >= 2 && score <= 4) status = "Warning";
                                              else status = "Unsafe";
                                              return `Score: ${score}\nStatus: ${status}`;
                                            }
                                          }
                                        }
                                      }
                                      // Customize options as needed
                                    }}
                                  />
                                  
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                    

                    

{lineChartData && (
                      <div className="line-chart">
                        <h3>Line Chart</h3>
                            <Line data={{
                              labels: Object.keys(week0Data['Martha']), // Assuming 'Martha' is the patient name
                              datasets: lineChartData,
                            }} 
                            options={{}} />
                      </div>
                    )}

        

        </div>

                  ) : (
                    <p></p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
  
}

export default Basic;