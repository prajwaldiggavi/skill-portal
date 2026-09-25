package com.skillportal.material;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materials")
@Tag(name = "Study Materials", description = "Endpoints for accessing PDFs, study guides, and downloadable resources")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    @Operation(summary = "Get all available study materials")
    public ResponseEntity<ApiResponse<List<MaterialDto.MaterialItem>>> getAllMaterials(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        List<MaterialDto.MaterialItem> materials = materialService.getAllMaterials(userId);
        return ResponseEntity.ok(ApiResponse.success(materials));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a specific study material")
    public ResponseEntity<ApiResponse<MaterialDto.MaterialItem>> getMaterialById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        MaterialDto.MaterialItem item = materialService.getMaterialById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Upload/register new study material")
    public ResponseEntity<ApiResponse<Long>> createMaterial(@Valid @RequestBody MaterialDto.CreateMaterialRequest request) {
        Long id = materialService.createMaterial(request);
        return ResponseEntity.ok(ApiResponse.success("Study material registered", id));
    }
}
