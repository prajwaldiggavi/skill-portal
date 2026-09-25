package com.skillportal.coding;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CodingService {

    private final CodingRepository codingRepository;
    private final CodeExecutionEngine codeExecutionEngine;

    public CodingService(CodingRepository codingRepository, CodeExecutionEngine codeExecutionEngine) {
        this.codingRepository = codingRepository;
        this.codeExecutionEngine = codeExecutionEngine;
    }

    public CodingDto.RunCodeResponse runCode(CodingDto.RunCodeRequest request) {
        List<CodeExecutionEngine.TestCaseItem> testCases;
        if (request.getCustomInput() != null && !request.getCustomInput().isBlank()) {
            testCases = List.of(new CodeExecutionEngine.TestCaseItem(0L, request.getCustomInput(), "", false));
        } else {
            // Load visible sample test cases only
            testCases = codingRepository.findTestCasesByProblemId(request.getProblemId(), false);
        }

        CodeExecutionEngine.ExecutionRequest execReq = new CodeExecutionEngine.ExecutionRequest(
                request.getCode(),
                request.getLanguage(),
                testCases,
                2000,
                256
        );

        CodeExecutionEngine.ExecutionResult execRes = codeExecutionEngine.execute(execReq);

        CodingDto.RunCodeResponse response = new CodingDto.RunCodeResponse();
        response.setStatus(execRes.getStatus());
        response.setPassedCount(execRes.getPassedCount());
        response.setTotalCount(execRes.getTotalCount());
        response.setRuntimeMs(execRes.getRuntimeMs());
        response.setMemoryKb(execRes.getMemoryKb());
        response.setCompileOutput(execRes.getCompileOutput());
        response.setTestCaseResults(execRes.getTestCaseResults());

        return response;
    }

    @Transactional
    public CodingDto.SubmitCodeResponse submitCode(Long userId, CodingDto.SubmitCodeRequest request) {
        // Load ALL test cases (visible + hidden)
        List<CodeExecutionEngine.TestCaseItem> testCases = codingRepository.findTestCasesByProblemId(request.getProblemId(), true);

        CodeExecutionEngine.ExecutionRequest execReq = new CodeExecutionEngine.ExecutionRequest(
                request.getCode(),
                request.getLanguage(),
                testCases,
                2000,
                256
        );

        CodeExecutionEngine.ExecutionResult execRes = codeExecutionEngine.execute(execReq);

        int maxMarks = codingRepository.getQuestionMarks(request.getQuestionId());
        int marksAwarded = 0;
        if ("ACCEPTED".equals(execRes.getStatus())) {
            marksAwarded = maxMarks;
        } else if (execRes.getTotalCount() > 0) {
            // Partial marks support (Requirement 22)
            marksAwarded = (int) Math.round(((double) execRes.getPassedCount() / execRes.getTotalCount()) * maxMarks);
        }

        // Save submission to database
        Long submissionId = codingRepository.saveSubmission(
                userId,
                request.getProblemId(),
                request.getQuestionId(),
                request.getCode(),
                request.getLanguage(),
                execRes.getStatus(),
                execRes.getPassedCount(),
                execRes.getTotalCount(),
                execRes.getRuntimeMs(),
                execRes.getMemoryKb(),
                execRes.getCompileOutput()
        );

        // Update Question Attempts
        String attemptStatus = "ACCEPTED".equals(execRes.getStatus()) ? "SOLVED" : "ATTEMPTED";
        codingRepository.updateQuestionAttempt(userId, request.getQuestionId(), request.getAssignmentId(), attemptStatus, marksAwarded);

        if ("ACCEPTED".equals(execRes.getStatus())) {
            codingRepository.awardPointsAndLogProgress(userId, request.getQuestionId(), marksAwarded);
        }

        CodingDto.SubmitCodeResponse response = new CodingDto.SubmitCodeResponse();
        response.setSubmissionId(submissionId);
        response.setStatus(execRes.getStatus());
        response.setPassedTestCases(execRes.getPassedCount());
        response.setTotalTestCases(execRes.getTotalCount());
        response.setRuntimeMs(execRes.getRuntimeMs());
        response.setMemoryKb(execRes.getMemoryKb());
        response.setMarksAwarded(marksAwarded);
        response.setCompileOutput(execRes.getCompileOutput());
        response.setTestCaseResults(execRes.getTestCaseResults());

        return response;
    }

    public List<CodingDto.SubmissionHistoryItem> getSubmissionHistory(Long userId, Long questionId) {
        return codingRepository.findSubmissions(userId, questionId);
    }
}
