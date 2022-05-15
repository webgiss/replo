import { useEffect, useRef } from 'react'
import './Stack.css'

const Stack = ({ stack, addInput, input, error, onInputChanged }) => {
    const inputRef = useRef(null);
    useEffect(() => {
        inputRef.current.focus()
    })
    return <div className='StackZone'>
        <div className='Stack'>
            {
                stack.map(
                    (stackItem, index) => <div key={index} className='StackItem'>
                        <div className='StackLevel'>{stack.length - index}</div>:
                        <div className='StackElement'>{stackItem.repr}</div>
                    </div>
                )
            }
        </div>
        <form onSubmit={(e) => { addInput(input); e.preventDefault(); }} className='StackForm'>
            <input ref={inputRef} className='Input' value={input} onChange={(e) => onInputChanged(e.target.value)} />
        </form>
        {error !== null ? <div className='Error'>{error}</div> : ""}
    </div>
}

export default Stack