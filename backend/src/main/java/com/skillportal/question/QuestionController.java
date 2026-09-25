package com.skillportal.question;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/questions")
@Tag(name = "Question Bank & MCQs", description = "Endpoints for viewing questions and grading MCQ responses")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get question details (options are stripped of is_correct for security)")
    public ResponseEntity<ApiResponse<QuestionDto.QuestionDetail>> getQuestionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        QuestionDto.QuestionDetail question = questionService.getQuestionById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(question));
    }

    @PostMapping("/{id}/attempts")
    @Operation(summary = "Submit and grade MCQ answer server-side")
    public ResponseEntity<ApiResponse<QuestionDto.AttemptResult>> submitAttempt(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody QuestionDto.SubmitMcqAttemptRequest request) {
        QuestionDto.AttemptResult result = questionService.submitMcqAttempt(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Question graded successfully", result));
    }
}
