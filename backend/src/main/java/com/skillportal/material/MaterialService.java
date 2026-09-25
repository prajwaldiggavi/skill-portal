package com.skillportal.material;

import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;

    public MaterialService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    public List<MaterialDto.MaterialItem> getAllMaterials(Long userId) {
        return materialRepository.findAllMaterials(userId);
    }

    public MaterialDto.MaterialItem getMaterialById(Long id, Long userId) {
        return materialRepository.findMaterialById(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
    }

    public Long createMaterial(MaterialDto.CreateMaterialRequest request) {
        return materialRepository.createMaterial(request);
    }
}
