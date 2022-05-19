import React from 'react';
import Checkbox from './checkbox';

const SensorSelector = (props: {
    selectedSensors: { [key: string]: boolean };
    setSelectedSensors(s: { [key: string]: boolean }): void;
}) => {
    return (
        <div className="w-full flex-row-left gap-x-4">
            {Object.keys(props.selectedSensors)
                .sort()
                .map((k) => (
                    <Checkbox
                        key={k}
                        label={k}
                        value={props.selectedSensors[k]}
                        setValue={(v) =>
                            props.setSelectedSensors({ ...props.selectedSensors, [k]: v })
                        }
                    />
                ))}
        </div>
    );
};

export default SensorSelector;
