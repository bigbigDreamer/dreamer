import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, message } from 'antd';

import AnalyticCore from '../src';

const core = new AnalyticCore();

const Demo: FC = () => {
    const [loading, setLoading] = useState(false);

    const handleBefore = useCallback(() => setLoading(true), []);

    const handleAfter = useCallback(() => setLoading(false), []);

    const handleSuccess = useCallback((val) => {
        message.success('解析成功，请打开控制台查看结果');
        console.log('解析成功：', val);
    }, []);

    const handleError = useCallback((e) => {
        message.error(e?.message || '解析失败');
    }, []);

    useEffect(() => {
        core.init({
            success: handleSuccess,
            error: handleError,
            before: handleBefore,
            after: handleAfter,
        });
    }, [handleSuccess, handleAfter, handleError, handleBefore]);

    useEffect(() => {
        return () => core.destroy();
    }, []);

    return (
        <Button loading={loading} onClick={() => core.upload()}>
            解析 excel
        </Button>
    );
};

export default Demo;
