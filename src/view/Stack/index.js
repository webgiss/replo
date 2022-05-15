import { useDispatch, useSelector } from 'react-redux'
import rplSlice from '../../slices/rplSlice'
import Internal from './Stack'

const Stack = () => {
    const stack = useSelector((state) => state.rpl.stack)
    const error = useSelector((state) => state.rpl.error)
    const input = useSelector((state) => state.rpl.input)
    const dispatch = useDispatch()
    const addInput = (input) => dispatch(rplSlice.actions.addInput({ input }))
    const onInputChanged = (input) => dispatch(rplSlice.actions.updateInput({ input }))
    return Internal({ stack, addInput, input, error, onInputChanged })
}

export default Stack