import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../../../redux/store"
import SelectInputField from "../../ui/SelectInputField";
import RadioInputField from "../../ui/RadioInputField";
import ImageQuantityInputField from "../../ui/ImageQuantityInputField";
import { addQuestionAnswer, decrementStep, incrementStep } from "../../../redux/reducers/userAnswerSlice";
import { nextQuestion, previousQuestion } from "../../../redux/reducers/serviceQuestionsSlice";
import { useState } from "react";

const QuestionComponent = () => {

    // dispatch method for dispatching the actions.
    const dispatch = useDispatch<AppDispatch>();
    const [answer,setAnswer] = useState<any>(null);

    // set the user answer of the particular question
    const handleSetAnswer = (
        answer: string | any,
        question_id: string,
        service_id: string,
        service_name: string,
        question_text: string,
        question_type: string,
        question_label: string 
    ) => {
            setAnswer((prevAnswers: any) => {
                // Check if we already have an answer for this question
                if (prevAnswers && prevAnswers.question_id === question_id) {
                    // If it's not a radio type question, handle multiple input fields
                    if (question_type !== "radio") {
                        // Go through existing answers and find if the label is already present
                        const updatedAnswerArray = prevAnswers.answer.map(
                            (item: any) => {
                                // If the label exists, update the value
                                if (item.question_label === question_label) {
                                    return {
                                        ...item,
                                        question_ans: answer,
                                    };
                                }
                                return item;
                            }
                        );
    
                        // Check if the label was found, if not, add a new one
                        const isLabelExists = updatedAnswerArray.some(
                            (item: any) => item.question_label === question_label
                        );
    
                        // If the label is not in the array, we push a new object with the label and answer
                        if (!isLabelExists) {
                            updatedAnswerArray.push({
                                question_label: question_label,
                                question_ans: answer,
                            });
                        }
    
                        // Return the updated answer with the new or updated label
                        return {
                            ...prevAnswers,
                            answer: updatedAnswerArray,
                        };
                    } else {
                        // If it's a radio type question, we just update the answer directly (as a string)
                        return {
                            ...prevAnswers,
                            answer: answer,
                        };
                    }
                } else {
                    // If there's no answer for this question yet, create a new one
                    return {
                        question_id,
                        service_id,
                        service_name,
                        question_text,
                        question_type,
                        answer: question_type === "radio"
                            ? answer // If it's a radio type, store answer as a string
                            : [
                                {
                                    question_label: question_label, // For other types, store as array of objects
                                    question_ans: answer,
                                },
                            ],
                    };
                }
            });
    }

    /**
     *  current_question:- hold the current ask question
     *  question_step_count:- they count the step [example:- 5 question , so they like this: 0, 1, 2,..5]
     *  total_question_length:- total_question that we need to ask the user [additon of all the services quesion]
    */
    const { current_question, question_step_count, total_question_length, question_history } = useSelector((state: RootState) => state.instant_quote.questions);

    // This function determine the component for user to select their answer
    const determineAnswerComp = (question_answer_type: string) => {
        switch (question_answer_type) {
            case 'select': return <SelectInputField current_question={current_question!} setAnswer={handleSetAnswer} />;;
            case 'radio': return <RadioInputField current_question={current_question!} setAnswer={handleSetAnswer} />;
            case 'image_quantity_input_field': return <ImageQuantityInputField current_question={current_question!} setAnswer={handleSetAnswer} />
            default: return null
        }
    }

    /** 
     * Method for go to next component.
     * but here i am checking. if questions is ongoing so decrement the question.
     * so, question component change not component.
     * but if the question_step_count is 0 so decrementStep so we can go to next 
     * component.
     * 
    */
   
    const handlePrevious = () => {
        if (question_step_count == 0 && question_history.length == 0) {
            // change the component
            dispatch(decrementStep());
        } else {
            // If question ongoing so change the question
            dispatch(previousQuestion());
        }
    }

    // method for handling next question or next component
    const handleNext = async () => {
        /**
         * question_step_count is not completed all the question.
         * so change the change the question.
         * otherwise change the component.
         */
        if (question_step_count < total_question_length - 1) {
            // if user not filled up the answer so show them alert.
            if (answer) {
                await dispatch(addQuestionAnswer(answer)); // add question_answer in question_answer slice
                dispatch(nextQuestion(answer));
                setAnswer(null);
            } else {
                alert('Please give your answer !');
            }
        } else {
            // increment the step if all the question is asked
            dispatch((incrementStep()));
        }
    }

    return (
        <div className="w-full h-full flex flex-col relative items-center justify-between">
            <div className="w-full flex-1 grid sm:grid-cols-1 sm:grid-rows-2">
                {/* question */}
                <div className="w-full h-auto py-2.5 bg-[#d9edf7] flex flex-col items-center justify-center">
                    {current_question?.question_image && <img className="w-44 h-22" src={current_question.question_image} alt="" />}
                    <p className="text-xl text-[#1C1A5F] font-medium">{"#" + current_question?.question_service_type + " :"}</p>
                    <p className="text-2xl text-[#1C1A5F] text-center font-medium">{current_question?.question_text}</p>
                    {current_question?.question_description && <p className="text-base text-gray-500 text-center">{current_question.question_description}</p>}
                </div>

                {/* for answer */}
                <div className="w-full h-auto flex items-center justify-center">
                    {determineAnswerComp(current_question?.question_answer_type!)}
                </div>
            </div>

            {/* button navigation */}
            <div className="w-full shrink-0 mt-5 relative sm:bottom-2 h-16  flex items-center px-4">
                <button onClick={handlePrevious} className={`bg-active_stepbar_color absolute left-2 cursor-pointer text-white px-6 py-1.5 rounded-md`}>Back</button>
                <button onClick={handleNext} className={`absolute right-2 bg-active_stepbar_color cursor-pointer text-white px-6 py-1.5 rounded-md`}>Next</button>
            </div>
        </div>
    )
}

export default QuestionComponent