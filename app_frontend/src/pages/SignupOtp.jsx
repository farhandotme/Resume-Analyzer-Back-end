import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft,  AlertCircle, CheckCircle2 } from 'lucide-react';
import { verifyOtp, sendOtp } from '../services/authApi';

export default function SignupOtp() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [activeError, setActiveError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [resendSuccess, setResendSuccess] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const email = sessionStorage.getItem('signup_email') || '';

    // Redirect back if no email in session
    // useEffect(() => {
    //     if (!email) navigate('/signupEmail');
    // }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer === 0) return;
        const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [resendTimer]);

    const handleChange = (i, val) => {
        if (!/^\d?$/.test(val)) return; // digits only
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        setActiveError('');
        setResendSuccess(false);
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = [...otp];
        pasted.split('').forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            setActiveError('Please enter the full 6-digit code.');
            return;
        }

        try {
            setLoading(true);
            const data = await verifyOtp({ email, otp: code });
            if (data.success) {
                sessionStorage.setItem('signup_token', data.token);
                navigate('/signupOtp');
            }
        } catch (error) {
            setActiveError(error.response?.data?.error || 'Invalid or expired OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            await sendOtp({ email });
            setResendTimer(30);
            setResendSuccess(true);
            setActiveError('');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            setActiveError(error.response?.data?.error || 'Failed to resend. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const filled = otp.every((d) => d !== '');

    // Mask email for display: ne*****@gmail.com
    const maskedEmail = email
        ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
        : '';

    return (
        <div className='relative min-h-screen w-full bg-[#0A0A0A] text-white overflow-hidden flex items-center justify-center'>
            {/* Glows */}
            <div className='absolute pointer-events-none' style={{ top: 0, right: 0, width: '45%', height: '70%', background: 'radial-gradient(ellipse at 100% 0%, rgba(217,169,25,0.15) 0%, transparent 60%)' }} />
            <div className='absolute pointer-events-none' style={{ bottom: 0, left: 0, width: '45%', height: '70%', background: 'radial-gradient(ellipse at 0% 100%, rgba(217,169,25,0.12) 0%, transparent 60%)' }} />

            {/* SVG curves */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none' viewBox='0 0 1000 800' preserveAspectRatio='xMidYMid slice'>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <path key={`tr-${i}`} d={`M ${1000} ${i * 80} Q ${800 - i * 30} ${200 + i * 60} ${600 - i * 40} ${800}`} fill='none' stroke={`rgba(217,169,25,${0.2 - i * 0.02})`} strokeWidth='0.7' />
                ))}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <path key={`bl-${i}`} d={`M ${0} ${800 - i * 80} Q ${200 + i * 30} ${600 - i * 60} ${400 + i * 40} ${0}`} fill='none' stroke={`rgba(217,169,25,${0.17 - i * 0.02})`} strokeWidth='0.7' />
                ))}
            </svg>

            {/* Back */}
            <Link to='/signupEmail' className='group absolute top-6 left-6 flex items-center gap-1.5 text-sm md:text-base text-[#8a8686] hover:text-[#D9A919] transition-colors duration-200 z-10'>
                <ArrowLeft className='duration-300 group-hover:-translate-x-0.5 transition-transform' size={15} strokeWidth={2} />Back
            </Link>

            <div className='relative z-10 w-full max-w-sm mx-4 py-10 sm:py-12'>

                {/* Step indicator */}
                <div className='flex items-center justify-center gap-2 mb-6'>
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#2a1f00] border border-[#D9A919] flex items-center justify-center'>
                            <CheckCircle2 size={13} className='text-[#D9A919]' />
                        </div>
                        <span className='text-xs text-[#555]'>Your info</span>
                    </div>
                    <div className='w-8 h-px bg-[#D9A919] opacity-40' />
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#D9A919] flex items-center justify-center text-black text-xs font-bold'>2</div>
                        <span className='text-xs text-[#D9A919] font-medium'>Verify</span>
                    </div>
                    <div className='w-8 h-px bg-[#2a2a2a]' />
                    <div className='flex items-center gap-1.5'>
                        <div className='w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#555] text-xs font-bold'>3</div>
                        <span className='text-xs text-[#555]'>Password</span>
                    </div>
                </div>

                {/* Header */}
                <div className='text-center mb-6 sm:mb-8'>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Check your email</h1>
                    <p className='mt-2 text-sm text-[#8a8686] leading-relaxed'>
                        We sent a 6-digit code to{' '}
                        <span className='text-[#D9A919] font-medium'>{maskedEmail}</span>
                    </p>
                </div>

                {/* OTP inputs */}
                <div className='flex justify-center gap-2 sm:gap-3 mb-2' onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputRefs.current[i] = el)}
                            type='text'
                            inputMode='numeric'
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold rounded-xl bg-[#111] border transition-all duration-200 focus:outline-none
                                ${activeError ? 'border-[#ef4444] text-[#ef4444]' : digit ? 'border-[#D9A919] text-white' : 'border-[#2a2a2a] text-white focus:border-[#D9A919]'}`}
                        />
                    ))}
                </div>

                {/* Error / success */}
                <div style={{ maxHeight: activeError ? '40px' : '0', opacity: activeError ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.25s ease, opacity 0.2s ease' }}>
                    <p className='flex items-center justify-center gap-1.5 mt-2 text-xs text-[#ef4444]'>
                        <AlertCircle size={12} className='shrink-0' />{activeError}
                    </p>
                </div>
                <div style={{ maxHeight: resendSuccess ? '40px' : '0', opacity: resendSuccess ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.25s ease, opacity 0.2s ease' }}>
                    <p className='flex items-center justify-center gap-1.5 mt-2 text-xs text-[#22c55e]'>
                        <CheckCircle2 size={12} className='shrink-0' />New code sent successfully.
                    </p>
                </div>

                {/* Verify button */}
                <button
                    onClick={handleVerify}
                    disabled={!filled || loading}
                    className='w-full mt-5 py-2 sm:py-2.5 rounded-xl bg-[#D9A919] text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(217,169,25,0.35)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer'
                >
                    {loading ? (
                        <span className='flex items-center justify-center gap-2'>
                            <svg className='animate-spin' width='14' height='14' viewBox='0 0 24 24' fill='none'>
                                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' strokeOpacity='0.3' />
                                <path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
                            </svg>
                            Verifying…
                        </span>
                    ) : 'Verify'}
                </button>

                {/* Resend */}
                <p className='mt-4 text-center text-sm text-[#555]'>
                    Didn't receive it?{' '}
                    {resendTimer > 0 ? (
                        <span className='text-[#444]'>Resend in <span className='text-[#888]'>{resendTimer}s</span></span>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={resendLoading}
                            className='text-[#D9A919] hover:underline disabled:opacity-50 cursor-pointer transition-opacity duration-200'
                        >
                            {resendLoading ? 'Sending…' : 'Resend code'}
                        </button>
                    )}
                </p>

                {/* Wrong email */}
                <p className='mt-3 text-center text-xs text-[#444]'>
                    Wrong email?{' '}
                    <Link to='/signupEmail' className='text-[#888] hover:text-[#D9A919] transition-colors duration-200'>
                        Go back and change it
                    </Link>
                </p>

            </div>
        </div>
    );
}