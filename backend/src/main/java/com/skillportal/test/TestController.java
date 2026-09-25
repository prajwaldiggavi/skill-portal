package com.skillportal.test;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tests")
@Tag(name = "Test & Assessment Engine", description = "Endpoints for timed tests with server-authoritative deadline enforcement")
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping
    @Operation(summary = "Get all available tests with student attempt records")
    public ResponseEntity<ApiResponse<List<TestDto.TestSummary>>> getAllTests(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        List<TestDto.TestSummary> tests = testService.getAllTests(userId);
        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start or resume test attempt; returns server-authoritative deadline and remaining seconds")
    public ResponseEntity<ApiResponse<TestDto.StartTestResponse>> startTest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        TestDto.StartTestResponse response = testService.startOrResumeTest(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Test session active", response));
    }

    @PostMapping("/{id}/answers")
    @Operation(summary = "Save answer draft during test (checks server deadline before persisting)")
    public ResponseEntity<ApiResponse<Void>> saveAnswer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TestDto.SaveAnswerRequest request) {
        testService.saveAnswer(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Answer saved", null));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Finalize and submit test for server-side grading")
    public ResponseEntity<ApiResponse<TestDto.TestResultSummary>> submitTest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TestDto.SubmitTestRequest request) {
        TestDto.TestResultSummary result = testService.submitTest(principal.getId(), request.getAttemptId());
        return ResponseEntity.ok(ApiResponse.success("Test evaluated successfully", result));
    }

    @GetMapping("/{id}/attempts/{attemptId}/result")
    @Operation(summary = "Get detailed test results and question review breakdown")
    public ResponseEntity<ApiResponse<TestDto.TestResultSummary>> getResult(
            @PathVariable Long id,
            @PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        TestDto.TestResultSummary result = testService.getResult(principal.getId(), attemptId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
