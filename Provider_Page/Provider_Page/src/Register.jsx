import React from 'react';

export default function UxPinFlexbox() {
    return (
        <div
            style={{
                display: 'flex',
                boxSizing: 'border-box',
                flexDirection: 'row',
                justifyContent: 'start',
                alignItems: 'stretch',
                gap: 'NaNpx',
                width: '100%',
                height: '100%'
            }}
        />
    );
}