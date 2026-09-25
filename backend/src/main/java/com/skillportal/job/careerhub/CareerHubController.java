package com.skillportal.job.careerhub;

import com.skillportal.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/career-hub")
public class CareerHubController {

    private final CareerHubService careerHubService;

    public CareerHubController(CareerHubService careerHubService) {
        this.careerHubService = careerHubService;
    }

    @GetMapping("/sources")
    public ApiResponse<List<CareerSource>> getSources() {
        return ApiResponse.success("Career sources retrieved successfully", careerHubService.getAllCareerSources());
    }

    @PostMapping("/sources")
    public ApiResponse<CareerSource> addSource(@RequestBody Map<String, String> payload) {
        String companyName = payload.get("companyName");
        String careerUrl = payload.get("careerUrl");
        CareerSource source = careerHubService.addCareerSource(companyName, careerUrl);
        return ApiResponse.success("Career source saved successfully", source);
    }

    @PostMapping("/sync")
    public ApiResponse<Map<String, String>> triggerSync() {
        careerHubService.triggerBackgroundExtraction();
        return ApiResponse.success("Background Career Hub extraction started", Map.of(
                "status", "BACKGROUND_PROCESSING_STARTED",
                "message", "Career sources are being evaluated in the background without blocking student requests."
        ));
    }
}
