const sample_form={
    info: {
        title: 'An automated form created in node.js by Yashsva',
        documentTitle: 'Yashsva Form',
    },
    form_body: {
        includeFormInResponse: true,
        requests: [
            {
                updateSettings: {
                    updateMask: '*',
                    settings: {
                        quizSettings: {
                            isQuiz: true,
                        },
                    }
                }
            },
            {
                createItem: {
                    location: {
                        index: 0,
                    },
                    item: {
                        title: "Who is prime minister of India ?",
                        questionItem: {
                            question: {
                                required: true,
                                choiceQuestion: {
                                    type: "RADIO",
                                    options: [
                                        {
                                            value: 'Jawaharlal Nehru'
                                        },
                                        {
                                            value: 'Narendra Modi'
                                        },
                                        {
                                            value: 'Indira Gandhi'
                                        },
                                        {
                                            value: 'Manmohan Singh'
                                        },

                                    ]
                                },
                                grading: {
                                    pointValue: 2,
                                    correctAnswers: {
                                        answers: [
                                            {
                                                value: 'Narendra Modi'
                                            }
                                        ],
                                    },
                                }
                            }
                        }
                    },
                }
            },
            {
                createItem: {
                    location: {
                        index: 1,
                    },
                    item: {
                        title: 'Write a short note on Internet.',
                        questionItem: {
                            question: {
                                required: true,
                                textQuestion: {
                                    paragraph: true,
                                },
                                grading: {
                                    pointValue: 5,

                                }
                            }
                        }
                    }
                }
            }
        ]
    }
}

exports.sample_form=sample_form