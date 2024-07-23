import { Button } from "@chakra-ui/react"

interface ResendotpProps {
    handleFunction: () => void; 
    resendTimeout: number;      
}


const Resendotp: React.FC<ResendotpProps> = ({handleFunction,resendTimeout}) => {
    const handleResend = () => {
        if (resendTimeout === 0) {
            handleFunction()
        }
    }
    return (
        <>
            {resendTimeout > 0 ? (
                <span>Resend OTP in {resendTimeout} seconds</span>
            ) : (
                <Button onClick={handleResend} className="resend-button">
                    Resend OTP
                </Button>
            )}
        </>
    )
}

export default Resendotp