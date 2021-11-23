import React, { FC, useCallback, useEffect } from 'react';
import { Button, message } from 'antd';

import AnalyticCore from '../src';

const core = new AnalyticCore();

const Demo: FC = () => {
    const handleSuccess = useCallback((val) => {
        console.log(val, 'ceshi');
    }, []);

    const handleError = useCallback((e) => {
        message.error(e?.message || '解析失败');
    }, []);

    useEffect(() => {
        core.init({
            success: handleSuccess,
            error: handleError,
        });
    }, [handleSuccess]);

    useEffect(() => {
        return () => core.destroy();
    }, []);

    return <Button onClick={() => core.upload()}>解析 excel</Button>;
};

export default Demo;
