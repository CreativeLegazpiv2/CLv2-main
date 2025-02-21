"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import graphicDesignAnimation from '../../../../../../public/lottie/animation/bg1.json';
import webDevelopmentAnimation from '../../../../../../public/lottie/animation/bg3.json';
import photographyAnimation from '../../../../../../public/lottie/animation/bg8.json';
import writingAnimation from '../../../../../../public/lottie/animation/bg6.json';
import musicAnimation from '../../../../../../public/lottie/animation/bg5.json';
import gamingAnimation from '../../../../../../public/lottie/animation/bg4.json';
import filmAnimation from '../../../../../../public/lottie/animation/bg7.json';
import fineArtsAnimation from '../../../../../../public/lottie/animation/bg9.json';
import fashionDesignAnimation from '../../../../../../public/lottie/animation/bg2.json';
import otherAnimation from '../../../../../../public/lottie/animation/bg10.json';
import { signupUser } from "@/services/authservice";
import { useRouter } from "next/navigation";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface UserDetail {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    creativeField: string;
    bday: string;
    address: string;
    bio: string;
    mobileNo: string;
    instagram: string;
    facebook: string;
    twitter: string;
    portfolioLink: string;
    gender: string; // Added gender field
}

interface FormAnswers {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    creativeField: string[];
    bday: string;
    address: string;
    bio: string;
    mobileNo: string;
    instagram: string;
    facebook: string;
    twitter: string;
    portfolioLink: string;
    gender: string; // Added gender field
}

export default function RegisterForm() {
    const [currentQuestion, setCurrentQuestion] = useState(-1);
    const [answers, setAnswers] = useState<FormAnswers>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        creativeField: [],
        bday: '',
        address: '',
        bio: '',
        mobileNo: '',
        instagram: '',
        facebook: '',
        twitter: '',
        portfolioLink: '',
        gender: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [transitioning, setTransitioning] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for form submission
    const router = useRouter();

    const backgrounds = [
        { domain: 'Graphic Design', animationData: graphicDesignAnimation },
        { domain: 'Web Development', animationData: webDevelopmentAnimation },
        { domain: 'Photography', animationData: photographyAnimation },
        { domain: 'Writing', animationData: writingAnimation },
        { domain: 'Music', animationData: musicAnimation },
        { domain: 'Gaming', animationData: gamingAnimation },
        { domain: 'Film', animationData: filmAnimation },
        { domain: 'Fine Arts', animationData: fineArtsAnimation },
        { domain: 'Fashion Design', animationData: fashionDesignAnimation },
        { domain: 'Other', animationData: otherAnimation },
    ];

    const questions = [
        {
            id: 'name',
            question: 'Please tell us your full name',
            type: 'text',
            required: true,
            helpText: 'Enter your complete name (First Name, Middle Name, Last Name, Suffix if any)'
        },
        {
            id: 'username',
            question: 'Choose a username',
            type: 'text',
            required: true
        },
        {
            id: 'email',
            question: 'What is your email address?',
            type: 'text',
            required: true,
            helpText: 'Please enter a valid email address (e.g., name@example.com)'
        },
        {
            id: 'password',
            question: 'Create a strong password',
            type: 'password',
            required: true,
            helpText: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters'
        },
        {
            id: 'confirmPassword',
            question: 'Confirm your password',
            type: 'password',
            required: true
        },
        {
            id: 'creativeField',
            question: "Select your primary creative domain",
            type: 'buttons',
            options: [
                'audiovisual-media',
                'digital-interactive-media',
                'creative-services',
                'design',
                'publishing-and-printing-media',
                'performing-arts',
                'visual-arts',
                'traditional-and-cultural-expressions',
                'cultural-sites'
            ],
            required: true,
            helpText: 'Please select exactly one option that best describes your primary creative field'
        },
        {
            id: 'bday',
            question: 'What is your birthday?',
            type: 'date',
            required: true
        },
        {
            id: 'address',
            question: 'What is your current address?',
            type: 'text',
            required: true
        },
        {
            id: 'mobileNo',
            question: 'What is your mobile number?',
            type: 'text',
            required: true,
            helpText: 'Enter your mobile number in +63XXXXXXXXXX or 09XXXXXXXXX format'
        },
        {
            id: 'bio',
            question: 'Tell us about yourself and your creative work (minimum 30 words)',
            type: 'textarea',
            required: true,
            helpText: 'Share your story, experience, and what drives your creative passion (minimum 30 words required)'
        },
        {
            id: 'gender',
            question: 'What is your gender?',
            type: 'buttons',
            options: ['male', 'female', 'other'],
            required: true
        },
        {
            id: 'instagram',
            question: 'What is your Instagram handle? (optional)',
            type: 'text',
            required: false
        },
        {
            id: 'facebook',
            question: 'Your Facebook profile URL (optional)',
            type: 'text',
            required: false
        },
        {
            id: 'twitter',
            question: 'Your Twitter handle (optional)',
            type: 'text',
            required: false
        },
        {
            id: 'portfolioLink',
            question: 'Share your portfolio link (optional)',
            type: 'text',
            required: false
        }
    ];

    const progress = ((currentQuestion + 1) / (questions.length + 1)) * 100;

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): { isValid: boolean; message: string } => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!hasUpperCase) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!hasLowerCase) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!hasNumbers) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }
        if (!hasSpecialChar) {
            return { isValid: false, message: 'Password must contain at least one special character' };
        }

        return { isValid: true, message: 'Password is strong' };
    };

    const validateMobileNo = (mobileNo: string): boolean => {
        const mobileRegex = /^(\+63|0)[9]\d{9}$/;
        return mobileRegex.test(mobileNo);
    };

    const validateBio = (bio: string): { isValid: boolean; message: string } => {
        const words = bio.trim().split(/\s+/).length;
        const minWords = 30;

        if (words < minWords) {
            return {
                isValid: false,
                message: `Please write at least ${minWords} words. Current word count: ${words}`
            };
        }

        return { isValid: true, message: '' };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setAnswers(prev => ({ ...prev, [id]: value }));
        setError(null);
    };

    const handleOptionToggle = (option: string) => {
        const currentQuestionObj = questions[currentQuestion];
        if (currentQuestionObj.id === 'creativeField') {
            setAnswers(prev => ({
                ...prev,
                creativeField: [option]
            }));
        } else if (currentQuestionObj.id === 'gender') {
            setAnswers(prev => ({
                ...prev,
                gender: option
            }));
        }
        setError(null);
    };

    const validateInput = () => {
        if (currentQuestion === -1) return true;

        const currentQuestionObj = questions[currentQuestion];
        if (!currentQuestionObj) {
            setError('An error occurred. Please try again.');
            return false;
        }

        switch (currentQuestionObj.id) {
            case 'name':
                if (!answers.name.trim()) {
                    setError('Full name is required');
                    return false;
                }
                break;

            case 'email':
                if (!validateEmail(answers.email)) {
                    setError('Please enter a valid email address');
                    return false;
                }
                break;

            case 'password':
                const passwordValidation = validatePassword(answers.password);
                if (!passwordValidation.isValid) {
                    setError(passwordValidation.message);
                    return false;
                }
                break;

            case 'confirmPassword':
                if (answers.confirmPassword !== answers.password) {
                    setError('Passwords do not match');
                    return false;
                }
                break;

            case 'creativeField':
                if (answers.creativeField.length !== 1) {
                    setError('Please select exactly one creative field');
                    return false;
                }
                break;

            case 'mobileNo':
                if (!validateMobileNo(answers.mobileNo)) {
                    setError('Please enter a valid mobile number (e.g., +639123456789 or 09123456789)');
                    return false;
                }
                break;

            case 'bio':
                const bioValidation = validateBio(answers.bio);
                if (!bioValidation.isValid) {
                    setError(bioValidation.message);
                    return false;
                }
                break;

            case 'gender':
                if (!answers.gender) {
                    setError('Please select your gender');
                    return false;
                }
                break;

            default:
                if (currentQuestionObj.required && (!answers[currentQuestionObj.id as keyof FormAnswers] || (typeof answers[currentQuestionObj.id as keyof FormAnswers] === 'string' && (answers[currentQuestionObj.id as keyof FormAnswers] as string).trim() === ''))) {
                    setError('This field is required');
                    return false;
                }
        }

        return true;
    };

    const submitForm = async () => {
        if (loading) return; // Prevent multiple submissions

        setLoading(true); // Set loading state to true

        const userDetails: UserDetail = {
            username: answers.username,
            email: answers.email,
            password: answers.password,
            confirmPassword: answers.confirmPassword,
            name: answers.name,
            creativeField: answers.creativeField[0],
            bday: answers.bday || '',
            address: answers.address,
            bio: answers.bio,
            mobileNo: answers.mobileNo,
            instagram: answers.instagram || '',
            facebook: answers.facebook || '',
            twitter: answers.twitter || '',
            portfolioLink: answers.portfolioLink || '',
            gender: answers.gender
        };

        try {
            await signupUser(
                userDetails.username,
                userDetails.email,
                userDetails.password,
                userDetails.name,
                userDetails.creativeField,
                userDetails.bday,
                userDetails.address,
                userDetails.mobileNo,
                userDetails.bio,
                userDetails.instagram,
                userDetails.facebook,
                userDetails.twitter,
                userDetails.portfolioLink,
                userDetails.gender // Added gender field
            );
            setCurrentQuestion(questions.length);
            setTimeout(() => {
                router.push("/signin");
            }, 2000);
        } catch (err: any) {
            // Handle specific error for email already existing
            if (err.message === "Signup failed:Email already exists.") {
                setError('Signup failed: Email already exists.');
            } else if (err.message === "Signup failed: Username already exists.") {
                setError('Failed to signup: Username already exists.');
            } else {
                setError('Signup failed. Please try again.');
            }
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const nextQuestion = () => {
        if (validateInput()) {
            setTransitioning(true);
            setTimeout(() => {
                if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                } else {
                    submitForm();
                }
                setTransitioning(false);
                setError(null);
            }, 300);
        }
    };

    const prevQuestion = () => {
        setTransitioning(true);
        setTimeout(() => {
            if (currentQuestion > -1) {
                setCurrentQuestion(currentQuestion - 1);
            }
            setTransitioning(false);
            setError(null);
        }, 300);
    };

    const currentBackgroundAnimation = backgrounds[currentQuestion + 1]?.animationData || backgrounds[0].animationData;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative transition-all duration-500">
            <Lottie
                animationData={currentBackgroundAnimation}
                loop={true}
                autoplay={true}
                className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0"
            />

            <div className="absolute z-10 top-0 left-0 w-full h-2 bg-transparent">
                <div
                    className="h-full bg-[#403737] transition-width duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="relative z-20 bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-4xl w-full animate-fade-in-up">
                {currentQuestion === -1 && (
                    <div className={`transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                        <h2 className="text-3xl font-bold mb-6 text-center leading-tight">
                            <span className="underline decoration-[#403737]">Welcome</span> to the Creative Individuals Registration Form!
                        </h2>
                        <p className="text-sm text-gray-700 mb-4 text-center">
                            We&apos;re excited to have you join us. Please take a moment to fill in your details below. Rest assured, your information will be kept secure in accordance with the <strong>Privacy Act</strong>.
                        </p>
                        <button
                            onClick={nextQuestion}
                            className="bg-[#403737] text-white px-6 py-3 rounded-full hover:bg-[#2f2f2f] transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2f2f2f] shadow-lg"
                        >
                            Let&apos;s Get Started
                        </button>
                    </div>
                )}

                {currentQuestion >= 0 && currentQuestion < questions.length && (
                    <div className={`transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                        <h2 className="text-xl font-semibold mb-4 leading-tight">
                            {questions[currentQuestion].question}
                        </h2>
                        {questions[currentQuestion].type === 'text' && (
                            <input
                                type="text"
                                id={questions[currentQuestion].id}
                                placeholder="Type your answer here..."
                                value={answers[questions[currentQuestion].id as keyof FormAnswers] as string}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-transparent border-b-2 border-gray-300 text-black placeholder-gray-500 outline-none mb-6 focus:border-[#403737] transition duration-300 ease-in-out focus:shadow-lg"
                            />
                        )}

                        {questions[currentQuestion].type === 'password' && (
                            <input
                                type="password"
                                id={questions[currentQuestion].id}
                                placeholder="Type your answer here..."
                                value={answers[questions[currentQuestion].id as keyof FormAnswers] as string}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-transparent border-b-2 border-gray-300 text-black placeholder-gray-500 outline-none mb-6 focus:border-[#403737] transition duration-300 ease-in-out focus:shadow-lg"
                            />
                        )}

                        {questions[currentQuestion].type === 'textarea' && (
                            <textarea
                                id={questions[currentQuestion].id}
                                placeholder="Type your answer here..."
                                value={answers[questions[currentQuestion].id as keyof FormAnswers] as string}
                                onChange={handleInputChange}
                                maxLength={300}
                                rows={4}
                                className="w-full p-3 bg-transparent border-b-2 border-gray-300 text-black placeholder-gray-500 outline-none mb-6 focus:border-[#403737] transition duration-300 ease-in-out focus:shadow-lg"
                            />
                        )}

                        {questions[currentQuestion].type === 'buttons' && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {questions[currentQuestion].options?.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionToggle(option)}
                                        className={`px-4 py-2 rounded-full transition ${answers.creativeField.includes(option)
                                            ? 'bg-[#403737] text-white shadow-lg'
                                            : answers.gender == option
                                                ? 'bg-[#939292] text-white shadow-lg'
                                                : 'bg-gray-200 text-black'
                                            } hover:bg-[#939292] hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-[#403737]`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}


                        {questions[currentQuestion].type === 'date' && (
                            <input
                                type="date"
                                id={questions[currentQuestion].id}
                                value={answers[questions[currentQuestion].id as keyof FormAnswers] as string}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-transparent border-b-2 border-gray-300 text-black placeholder-gray-500 outline-none mb-6 focus:border-[#403737] transition duration-300 ease-in-out focus:shadow-lg"
                                required
                            />
                        )}

                        {questions[currentQuestion].helpText && (
                            <p className="text-sm text-gray-600 mb-4">{questions[currentQuestion].helpText}</p>
                        )}

                        {error && <p className="text-red-500 mb-4 animate-pulse">{error}</p>}

                        <div className="flex gap-4">
                            {currentQuestion > -1 && (
                                <button
                                    onClick={prevQuestion}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-600 shadow-lg"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={nextQuestion}
                                disabled={loading} // Disable button during loading
                                className={`bg-[#403737] text-white px-6 py-3 rounded-full hover:bg-[#2f2f2f] transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2f2f2f] shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Submitting...' :
                                    currentQuestion === questions.length - 1 ? 'Submit' :
                                        answers[questions[currentQuestion].id as keyof FormAnswers] === '' && !questions[currentQuestion].required ? 'Skip' : 'Next'}
                            </button>

                        </div>
                    </div>
                )}

                {currentQuestion === questions.length && (
                    <div className={`transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                        <h2 className="text-2xl font-semibold mb-4 text-center leading-tight">
                            We&apos;re delighted to have you on board!
                        </h2>
                        <p className="text-sm text-gray-700 mb-4 text-center">
                            We&apos;re also grateful for your time and effort on sharing your details with us. Please keep in touch with us on our website <a className="underline text-[#403737]">creativelegazpi.ph</a> Thank you so much! We&apos;ll be in touch!.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}