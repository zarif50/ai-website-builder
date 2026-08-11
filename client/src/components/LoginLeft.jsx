import React from 'react'

const LoginLeft = () => {
    return (
        <div className="flex lg:w-2/5 bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat flex-col justify-between p-12">
            <div className='flex items-center gap-4'>
                <img src="/logo.svg" alt="Logo" className="size-9.5" />
                <span className="text-3xl font-bold text-zinc-50">BuilderAI</span>
            </div>
            <div>
                <h2 className="text-3xl text-white font-medium leading-snug mb-3 tracking-tight">Build your Website with Ease</h2>
                <p className="text-zinc-300">Describe what you want and let our AI do the rest!Build it in a clean Layout</p>
                <p className="text-zinc-300 text-sm mt-12">Copyright {new Date().getFullYear()} BuilderAI. All rights reserved.</p>
            </div>

        </div>
    )
}
console.log("LoginLeft rendered");
export default LoginLeft