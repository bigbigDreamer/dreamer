import Excel, { Worksheet } from 'exceljs';

class VM {
    private $el: HTMLInputElement | null;
    protected $onChange: ((e: InputEvent) => void) | undefined;
    constructor() {
        this.$el = null;
    }

    /**
     * 初始化，注册劫持 onChange
     */
    init({ onChange }: { onChange: ((e: Event) => void) | undefined }) {
        this.$onChange = onChange;
    }

    /**
     * @desc 创建 input el
     */
    createEl() {
        this.$el = document.createElement('input');
        this.$el.type = 'file';
        this.$el.onchange = (e: Event) => this.$onChange?.(<InputEvent>e);
    }

    /**
     * @desc 自动触发点击
     */
    autoClick() {
        this.$el?.click?.();
    }

    /**
     * @desc 释放内存
     */
    destroy() {
        this.$el = null;
    }
}

abstract class BaseCore {
    protected constructor() {}
    abstract init(config: {
        before?(): void;
        after?(): void;
        success?(val?: any): void;
        error?(err?: Error): void;
    }): void;
}

class AnalyticCore implements BaseCore {
    // . 更多的文件类型可以查阅：https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
    static DEFAULT_SUPPORTED_FILE_TYPE =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    private $excelBuffer: Buffer | undefined;
    private $vm: VM | undefined;
    private $workbook: Excel.Workbook | undefined;
    private $worksheet: Worksheet | undefined;
    private _analyticResult: Record<string, any[]>;
    private _dictionary: Record<string, string>;

    /** 解析成功 */
    private $success?(val?: any): void;
    /** 解析失败/错误 */
    private $error?(error: Error): void;
    /** 解析前 */
    private $before?(): void;
    /** 解析后（无论成功与否都会调用） */
    private $after?(): void;

    constructor() {
        /** 在构造函数中初始化 dom 的好处是可以有效的复用 dom，并且前置 dom 动态创建的可忽略延迟 */
        this.initDom();
        this.buildWorkBook();
        this._analyticResult = {};
        this._dictionary = {};
    }

    private buildWorkBook() {
        this.$workbook = new Excel.Workbook();
    }

    private async readWorkBookAndBuildSheet(buffer: Buffer | undefined) {
        await this.$workbook?.xlsx?.load(buffer as Buffer);
        await this.buildWorkSheet();
    }
    private buildWorkSheet() {
        // 暂时先爆一个 warning 出来，暂不支持多个 sheet，默认取第一个
        console.warn(
            'Currently does not support multiple sheets, the first one is selected by, will consider support in the future',
        );
        this.$worksheet = this.$workbook?.getWorksheet(1);
    }

    /**
     * @desc 初始化 analytic core config
     */
    init(config: {
        before?(): void;
        after?(): void;
        success?(val?: any): void;
        error?(err?: Error): void;
    }): void {
        this.$success = config?.success;
        this.$after = config?.after;
        this.$before = config?.before;
        this.$error = config?.error;
    }

    /**
     * @desc 初始化 dom 并且自动触发点击
     */
    private initDom() {
        const vm = (this.$vm = new VM());
        vm.init({
            onChange: (e) => this.hijackDomEvent(e),
        });
        vm.createEl();
    }

    upload() {
        this.$vm?.autoClick();
    }

    /**
     * analytic excel
     */
    private async analyticExcel(buffer: Buffer | undefined) {
        try {
            await this.readWorkBookAndBuildSheet(buffer);
            this.$worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    row.eachCell((cell, colNumber) => {
                        this._dictionary[colNumber] = cell?.value as string;
                        this._analyticResult[this._dictionary[colNumber]] = [];
                    });
                }
            });

            this.$worksheet?.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    row.eachCell((cell, colNumber) => {
                        this._analyticResult[this._dictionary[colNumber]].push(
                            cell?.value,
                        );
                    });
                }
            });
            this.$success?.(this._analyticResult);
            return this._analyticResult;
        } catch (e) {
            console.error(e);
            this.$error?.(
                new Error(
                    'Excel parsing failed, please check if the file is damaged or change the suffix',
                ),
            );
        } finally {
            this.$after?.();
        }
    }

    /**
     * @desc 劫持 dom 事件
     */
    private hijackDomEvent(e: Event) {
        this.$before?.();
        if ((e?.target as any)?.files.length > 0) {
            this.$excelBuffer = (e?.target as any)?.files?.[0];
            if (
                (this.$excelBuffer as Record<string, any>).type !==
                AnalyticCore.DEFAULT_SUPPORTED_FILE_TYPE
            ) {
                this.$error?.(
                    new Error(
                        'The current file type is not currently supported, please upload an excel file in .xlsx ',
                    ),
                );
                this.$after?.();
                console.error(
                    'The current file type is not currently supported, please upload an excel file in .xlsx',
                );
                return;
            }
            this.analyticExcel(this.$excelBuffer);
        }
    }

    /**
     * @desc 释放内存
     */
    destroy() {
        this.$vm?.destroy();
        this.$excelBuffer = undefined;
        this.$vm = undefined;
        this._dictionary = {};
        this._analyticResult = {};
    }
}

export default AnalyticCore;
