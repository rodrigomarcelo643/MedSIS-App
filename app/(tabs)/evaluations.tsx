import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/constants/Config";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import {
  Evaluation,
  EvaluationResponse,
  GradeUploadPermission,
  GradeUploadPermissionResponse,
  GradeImage,
  GradeImagesResponse,
} from "@/@types/tabs";
import axios from "axios";

// Components
import GradeUploadPermissionBanner from '@/components/evaluations/GradeUploadPermissionBanner';
import GradeUploadModal from '@/components/evaluations/GradeUploadModal';
import YearLevelSection, { UploadState } from '@/components/evaluations/YearLevelSection';
import EvaluationSkeleton from '@/components/evaluations/EvaluationSkeleton';
import EvaluationSummaryCard from '@/components/evaluations/EvaluationSummaryCard';
import EvaluationDetailModal from '@/components/evaluations/EvaluationDetailModal';
import { useDispatch, useSelector } from "@/redux/store";
import { 
  setEvaluationData, 
  setEvaluationPermissions, 
  setGradeImages, 
  setEvaluationsLoading, 
  setEvaluationsError 
} from "@/redux/actions";

// year_level slug → year_levels.id mapping (matches DB seed data)
const YEAR_LEVEL_ID_MAP: Record<string, number> = {
  first_year:  1,
  second_year: 2,
  third_year:  3,
  fourth_year: 4,
};

const YEAR_LEVEL_NAMES = ["first_year", "second_year", "third_year", "fourth_year"] as const;

function yearLevelToNumber(name: string): number {
  const levels: Record<string, number> = {
      'first_year': 1, 'second_year': 2, 'third_year': 3, 'fourth_year': 4,
      'Year 1': 1, 'Year 2': 2, 'Year 3': 3, 'Year 4': 4, 'Graduating': 4
  };
  return levels[name] ?? 0;
}

function formatYearLevel(yearLevel: string) {
  if (yearLevel === "fourth_year") return "Fourth Year (Clerkship)";
  return yearLevel
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Main Evaluation Tab
 * Logic:
 * 1. Fetches student evaluation records, grade images, and upload permissions.
 * 2. Renders a summary board and year-level specific modules.
 * 3. Handles status calculation (Open/Locked/Complete) per year level.
 */
const Evaluations: React.FC = () => {
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, "background");

  // ── Data State ─────────────────────────────────────────────────────────────
  const dispatch = useDispatch();
  const { data: evaluationData, permissions, gradeImages, loading, error } = useSelector(state => state.evaluations);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [detailVisible,      setDetailVisible]      = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{ id: number, name: string } | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchEvaluationData = useCallback(async () => {
    if (!user?.id) return;
    try {
      dispatch(setEvaluationsLoading(true));
      const response = await axios.get(
        `${API_BASE_URL}/api/evaluations/get_evaluation.php?user_id=${user.id}`,
        { timeout: 10000 }
      );
      if (response.data.error) {
        Alert.alert("Error", response.data.error);
        dispatch(setEvaluationsError(response.data.error));
        return;
      }
      dispatch(setEvaluationData(response.data));
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
      dispatch(setEvaluationsError("Error fetching evaluation data"));
    } finally {
      dispatch(setEvaluationsLoading(false));
      setRefreshing(false);
    }
  }, [user?.id, dispatch]);

  const fetchUploadPermissions = useCallback(async () => {
    try {
      const response = await axios.get<GradeUploadPermissionResponse>(
        `${API_BASE_URL}/api/grade_uploads/check_upload_permission.php`
      );
      if (response.data.success) {
        dispatch(setEvaluationPermissions(response.data.permissions));
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  }, [dispatch]);

  const fetchGradeImages = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get<GradeImagesResponse>(
        `${API_BASE_URL}/api/grade_uploads/get_grade_images.php?user_id=${user.id}`
      );
      if (res.data.success) {
        dispatch(setGradeImages(res.data.images));
      }
    } catch (err) {
      console.error("Error fetching grade images:", err);
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (user) {
      fetchEvaluationData();
      fetchUploadPermissions();
      fetchGradeImages();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvaluationData();
    fetchUploadPermissions();
    fetchGradeImages();
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────
  if (loading) return <EvaluationSkeleton />;
  if (!evaluationData) return null;

  const studentYearLevelId  = Number(user?.year_level_id);
  const studentYearLevelNum = yearLevelToNumber(user?.year_level_name || "");

  return (
    <>
      <ScrollView 
        style={{ flex: 1, backgroundColor }} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 1. Status Banner */}
        {permissions && permissions[studentYearLevelId] && (
          <View style={{ marginTop: 12 }}>
            <GradeUploadPermissionBanner 
              isEnabled={permissions[studentYearLevelId].is_enabled} 
              yearLevelName={permissions[studentYearLevelId].name} 
            />
          </View>
        )}

        {/* 2. Evaluation Summary Card */}
        <EvaluationSummaryCard 
          passed={evaluationData.summary.passed_courses}
          failed={evaluationData.summary.failed_courses}
          total={evaluationData.summary.total_courses}
          percentage={evaluationData.summary.completion_percentage}
        />

        {/* 3. Year Level Sections */}
        {YEAR_LEVEL_NAMES.map((slug) => {
          const evals   = evaluationData.evaluations.filter(e => e.year_level === slug);
          const ylId    = YEAR_LEVEL_ID_MAP[slug];
          const ylNum   = yearLevelToNumber(slug);
          const isPermitted = permissions?.[ylId]?.is_enabled ?? false;
          
          const allGradesFilled = evals.length > 0 && evals.every(e => e.grade !== null && e.grade !== '');

          let uploadState: UploadState;
          if (ylNum > studentYearLevelNum) {
            uploadState = 'not_current';
          } else if (allGradesFilled) {
            uploadState = 'completed';
          } else if (isPermitted) {
            uploadState = 'open';
          } else {
            uploadState = 'admin_locked';
          }

          return (
            <YearLevelSection
              key={slug}
              yearLevel={slug}
              yearLevelId={ylId}
              yearLevelLabel={formatYearLevel(slug)}
              evaluations={evals}
              uploadState={uploadState}
              uploadedImageCount={gradeImages.filter(img => img.year_level_id === ylId).length}
              onPressEvaluation={(ev) => { 
                setSelectedEvaluation(ev); 
                setDetailVisible(true); 
              }}
              onPressUpload={() => {
                setActiveUploadTarget({ id: ylId, name: formatYearLevel(slug) });
                setUploadModalVisible(true);
              }}
            />
          );
        })}
      </ScrollView>

      {/* 4. Details Modal */}
      <EvaluationDetailModal
        visible={detailVisible}
        evaluation={selectedEvaluation}
        onClose={() => setDetailVisible(false)}
      />

      {/* 5. Grade Upload Modal */}
      {activeUploadTarget && (
        <GradeUploadModal
          visible={uploadModalVisible}
          onClose={() => setUploadModalVisible(false)}
          onUploaded={() => { fetchGradeImages(); setUploadModalVisible(false); }}
          userId={String(user?.id)}
          yearLevelId={activeUploadTarget.id}
          yearLevelName={activeUploadTarget.name}
          existingImages={gradeImages.filter(img => img.year_level_id === activeUploadTarget.id)}
        />
      )}
    </>
  );
};

export default Evaluations;
