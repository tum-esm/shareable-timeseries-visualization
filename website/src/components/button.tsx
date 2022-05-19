import React from 'react';

const Button = (props: { text: string; onClick(): void; disabled?: boolean }) => {
    return (
        <button
            className={
                'px-3 py-1.5 bg-green-300 text-green-900 rounded-md shadow-sm ' +
                (props.disabled ? 'cursor-not-allowed ' : '')
            }
            onClick={props.disabled ? () => {} : props.onClick}
            disabled={props.disabled ? true : false}
        >
            {props.text}
        </button>
    );
};

export default Button;
