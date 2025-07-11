class SecurityAuditor {
    auditFlow(flowAnalysisData, fileContent) {
        const vulnerabilities = [];
        
        // Check eval calls
        if (flowAnalysisData.evalCalls) {
            flowAnalysisData.evalCalls.forEach(evalCall => {
                vulnerabilities.push({
                    type: 'eval-usage',
                    line: evalCall.line,
                    code: this._getCodeLine(fileContent, evalCall.line)
                });
            });
        }
        
        return {
            filePath: flowAnalysisData.filePath,
            vulnerabilities: vulnerabilities,
            messageHandlers: flowAnalysisData.messageHandlers || []
        };
    }

    _getCodeLine(content, line) {
        if (!content || !line) return '';
        
        const lines = content.split('\n');
        const targetLine = line - 1;
        
        if (targetLine < 0 || targetLine >= lines.length) return '';
        
        return lines[targetLine].trim();
    }
}

module.exports = { SecurityAuditor };