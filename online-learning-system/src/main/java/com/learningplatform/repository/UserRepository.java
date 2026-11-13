
package com.learningplatform.repository;

import com.learningplatform.entity.Role;
import com.learningplatform.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByName(String name);

    // Learner management
    List<User> findByRole(Role role);

    Optional<User> findByIdAndRole(String id, Role role);
}
